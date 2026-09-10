import { describe, it, expect } from 'vitest';
import { createConversationLibrary } from './conversationLibrary';
import { ASSESSMENT_PROMPT, type AnswerStream } from './conversation';
import { streamAnswer } from '../mock/streamAnswer';
const instant: AnswerStream = prompt => streamAnswer(prompt, {speed: 0});
function memoryStorage() { const values = new Map<string,string>(); return {getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => {values.set(key,value);}}; }
async function finish(controller: ReturnType<ReturnType<typeof createConversationLibrary>['controller']>) {
  if (!controller.getSnapshot().busy) return;
  await new Promise<void>(resolve => {const unsub=controller.subscribe(() => {if (!controller.getSnapshot().busy) {unsub(); resolve();}});});
}
describe('conversation library', () => {
  it('keeps a streaming reply in its own thread while another thread starts with entity context', async () => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => {release=resolve;});
    const library=createConversationLibrary('floating',memoryStorage(),async function*(prompt){await gate;yield* instant(prompt);});
    const marcus=library.getSnapshot().activeId;
    library.controller(marcus).send(ASSESSMENT_PROMPT);
    library.controller(marcus).setDraft('My Marcus draft');
    const lena=library.create();
    library.controller(lena).send('Tell me about Lena Ortiz');await finish(library.controller(lena));
    expect(library.controller(lena).getSnapshot().messages[1].text).toContain('Lena Ortiz');
    expect(library.controller(lena).getSnapshot().messages.some(m=>m.card)).toBe(false);
    release();await finish(library.controller(marcus));
    expect(library.getSnapshot().activeId).toBe(lena);
    expect(library.controller(marcus).getSnapshot().messages[1].card?.rep).toBe('Marcus Bell');
    expect(library.controller(marcus).getSnapshot().draft).toBe('My Marcus draft');
  });
  it('restores names, pinning, drafts, evidence, and reading position without mixing option stores', async () => {
    const storage=memoryStorage();const library=createConversationLibrary('floating',storage,instant);const id=library.getSnapshot().activeId;
    library.controller(id).send(ASSESSMENT_PROMPT);await finish(library.controller(id));
    library.rename(id,'Quarterly coaching');library.pin(id,true);library.controller(id).setDraft('Next week');library.controller(id).setEvidenceOpen(true);library.controller(id).setReading({top:180,follow:false});
    const other=library.create();library.controller(other).send('Tell me about Percepto');await finish(library.controller(other));library.select(id);
    const restored=createConversationLibrary('floating',storage,instant);
    expect(restored.getSnapshot().threads.find(t=>t.id===id)).toMatchObject({title:'Quarterly coaching',pinned:true,state:{draft:'Next week',evidenceOpen:true,reading:{top:180,follow:false}}});
    expect(restored.getSnapshot().activeId).toBe(id);
    expect(createConversationLibrary('column',storage,instant).getSnapshot().threads).toHaveLength(1);
    expect(createConversationLibrary('column',storage,instant).getSnapshot().threads[0].state.messages).toHaveLength(0);
    const updated=restored.getSnapshot().threads.find(t=>t.id===id)!.updatedAt;restored.select(other);restored.select(id);
    expect(restored.getSnapshot().threads.find(t=>t.id===id)!.updatedAt).toBe(updated);
  });
  it('deletes an in-flight active thread without resurrecting it or contaminating the replacement', async () => {
    let release!: () => void;const gate=new Promise<void>(resolve=>{release=resolve;});
    const storage=memoryStorage();const library=createConversationLibrary('floating',storage,async function*(prompt){await gate;yield* instant(prompt);});
    const id=library.getSnapshot().activeId;const old=library.controller(id);old.send(ASSESSMENT_PROMPT);library.remove(id);release();await new Promise(resolve=>setTimeout(resolve,0));
    expect(library.getSnapshot().threads.some(t=>t.id===id)).toBe(false);
    expect(library.controller(library.getSnapshot().activeId).getSnapshot().messages).toEqual([]);
    expect(old.send('Anything')).toBe(false);
    expect(createConversationLibrary('floating',storage,instant).getSnapshot().threads.some(t=>t.id===id)).toBe(false);
  });
  it('recovers an interrupted saved response and tolerates malformed or unavailable storage', () => {
    const storage=memoryStorage();const library=createConversationLibrary('floating',storage,async function*(){await new Promise(()=>{});});
    const id=library.getSnapshot().activeId;library.controller(id).send(ASSESSMENT_PROMPT);
    const recovered=createConversationLibrary('floating',storage,instant);
    expect(recovered.controller(id).getSnapshot()).toMatchObject({busy:false,status:'Response interrupted by page reload.'});
    expect(recovered.controller(id).getSnapshot().messages[1]).toMatchObject({label:'Response interrupted',complete:false});
    storage.setItem('aria-conversations-v1-column','{bad');expect(createConversationLibrary('column',storage).getSnapshot().threads).toHaveLength(1);
    const blocked=createConversationLibrary('column',{getItem(){throw Error('Denied');},setItem(){throw Error('Denied');}});
    expect(blocked.getSnapshot().storageError).toBe(true);
    expect(blocked.controller(blocked.getSnapshot().activeId).send('Tell me about Lena')).toBe(true);
  });
  it('does not accumulate empty threads or overwrite a renamed title after follow-ups', async () => {
    const library=createConversationLibrary('floating',memoryStorage(),instant);const id=library.create();expect(library.create()).toBe(id);
    library.controller(id).setDraft('Unsent but important');const second=library.create();expect(second).not.toBe(id);expect(library.controller(id).getSnapshot().draft).toBe('Unsent but important');
    library.controller(second).send('Tell me about Didi Rao');await finish(library.controller(second));library.rename(second,'Didi check-in');library.controller(second).send('Tell me about Didi');await finish(library.controller(second));
    expect(library.getSnapshot().threads.find(t=>t.id===second)?.title).toBe('Didi check-in');
    const empty=library.create();library.select(second);expect(library.create()).toBe(empty);
    expect(library.getSnapshot().threads).toHaveLength(3);
  });
});
