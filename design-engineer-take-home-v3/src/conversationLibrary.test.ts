import { describe, it, expect, vi } from 'vitest';
import { createConversationLibrary } from './conversationLibrary';
import { ASSESSMENT_PROMPT, type AnswerStream } from './conversation';
import { streamAnswer } from '../mock/streamAnswer';
const instant: AnswerStream = prompt => streamAnswer(prompt, {speed: 0});
function memoryStorage() { const values = new Map<string,string>(); return {get length(){return values.size;},key:(index:number)=>[...values.keys()][index] ?? null,getItem: (key:string) => values.get(key) ?? null, setItem: (key:string,value:string) => {values.set(key,value);}}; }
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
    const blocked=createConversationLibrary('column',{length:0,key(){return null;},getItem(){throw Error('Denied');},setItem(){throw Error('Denied');}});
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

describe('cross-tab persistence', () => {
  it('merges a newer draft with another tab reading without moving local reading', () => {
    const storage=memoryStorage(); const a=createConversationLibrary('floating',storage);
    const id=a.getSnapshot().activeId; a.controller(id).setDraft('Original'); a.flush();
    const b=createConversationLibrary('floating',storage);
    a.controller(id).setDraft('Newer draft'); a.flush();
    b.controller(id).setReading({top:200,follow:false}); b.flush(); b.sync();
    expect(b.controller(id).getSnapshot()).toMatchObject({draft:'Newer draft',reading:{top:200,follow:false}});
    expect(createConversationLibrary('floating',storage).controller(id).getSnapshot().draft).toBe('Newer draft');
  });
  it('retains independently created threads and concurrent metadata edits', () => {
    const storage=memoryStorage(); const a=createConversationLibrary('column',storage); const b=createConversationLibrary('column',storage);
    const first=a.getSnapshot().activeId, second=b.getSnapshot().activeId;
    a.controller(first).setDraft('First'); b.controller(second).setDraft('Second'); a.flush(); b.flush(); a.sync(); b.sync();
    a.rename(first,'Named'); b.pin(first,true); a.sync();
    expect(a.getSnapshot().threads.find(t=>t.id===first)).toMatchObject({title:'Named',pinned:true});
    expect(a.controller(second).getSnapshot().draft).toBe('Second');
    expect(b.getSnapshot().activeId).toBe(second);
  });
  it('does not let a delayed older draft win over a newer edit', () => {
    vi.useFakeTimers();
    try {
      const storage=memoryStorage(); const a=createConversationLibrary('floating',storage);
      const id=a.getSnapshot().activeId; a.controller(id).setDraft('Seed'); a.flush();
      const b=createConversationLibrary('floating',storage);
      a.controller(id).setDraft('Older'); vi.setSystemTime(Date.now()+1000);
      b.controller(id).setDraft('Newer'); b.flush(); a.flush();
      expect(createConversationLibrary('floating',storage).controller(id).getSnapshot().draft).toBe('Newer');
    } finally {vi.useRealTimers();}
  });
  it('batches frequent reading changes and ignores unchanged values', () => {
    vi.useFakeTimers();
    try {
      const storage=memoryStorage(); const write=vi.spyOn(storage,'setItem'); const a=createConversationLibrary('floating',storage);
      const c=a.controller(a.getSnapshot().activeId); c.setDraft('Seed'); a.flush(); write.mockClear();
      for(let top=1;top<=50;top++) c.setReading({top,follow:false});
      expect(write).not.toHaveBeenCalled(); vi.advanceTimersByTime(200);
      expect(write).toHaveBeenCalledTimes(1);
      c.setReading({top:50,follow:false}); vi.advanceTimersByTime(200);
      expect(write).toHaveBeenCalledTimes(1);
      expect(write.mock.calls[0][0]).toContain('batch:');
    } finally {vi.useRealTimers();}
  });
  it('keeps recovered interruptions sendable after unrelated synchronization', () => {
    const storage=memoryStorage(); const a=createConversationLibrary('floating',storage,async function*(){await new Promise(()=>{});});
    const id=a.getSnapshot().activeId; a.controller(id).send(ASSESSMENT_PROMPT);
    const b=createConversationLibrary('floating',storage); a.rename(id,'Renamed elsewhere'); b.sync();
    expect(b.controller(id).getSnapshot().busy).toBe(false);
    expect(b.controller(id).getSnapshot().messages[1].label).toBe('Response interrupted');
  });
  it('does not resurrect a thread after another tab saves a late draft', () => {
    const storage=memoryStorage(); const a=createConversationLibrary('floating',storage);
    const id=a.getSnapshot().activeId; a.controller(id).setDraft('Seed'); a.flush();
    const b=createConversationLibrary('floating',storage); a.remove(id);
    b.controller(id).setDraft('Late draft'); b.flush(); b.sync();
    expect(b.getSnapshot().threads.some(t=>t.id===id)).toBe(false);
    expect(createConversationLibrary('floating',storage).getSnapshot().threads.some(t=>t.id===id)).toBe(false);
  });
});

it('migrates legacy history without rewriting or losing saved fields', () => {
  const storage=memoryStorage();
  const legacy=JSON.stringify({version:1,activeId:'legacy',threads:[{id:'legacy',title:'Original name',renamed:true,pinned:true,updatedAt:10,state:{messages:[],draft:'Saved draft',busy:false,status:'',hasStarted:false,evidenceOpen:true,reading:{top:12,follow:false}}}]});
  storage.setItem('aria-conversations-v1-floating',legacy);
  const library=createConversationLibrary('floating',storage);
  expect(library.getSnapshot().activeId).toBe('legacy');
  expect(library.getSnapshot().threads.find(t=>t.id==='legacy')).toMatchObject({title:'Original name',pinned:true,state:{draft:'Saved draft',evidenceOpen:true}});
  library.controller('legacy').setDraft('Updated draft');library.flush();
  expect(storage.getItem('aria-conversations-v1-floating')).toBe(legacy);
  expect(createConversationLibrary('floating',storage).controller('legacy').getSnapshot().draft).toBe('Updated draft');
});
