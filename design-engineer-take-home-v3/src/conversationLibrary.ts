import { createConversationController, ASSESSMENT_PROMPT, type AnswerStream, type ChatMessage, type ConversationState } from './conversation';
import type { AssistantLayout } from './pages';

type Controller = ReturnType<typeof createConversationController>;
export type SavedConversation = { id: string; title: string; renamed: boolean; pinned: boolean; updatedAt: number; state: ConversationState };
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'key' | 'length'>;
export type LibrarySnapshot = { activeId: string; threads: SavedConversation[]; storageError: boolean };
type Field = 'create' | 'delete' | 'name' | 'pinned' | 'updatedAt' | 'draft' | 'evidenceOpen' | 'reading' | 'message';
type Change = { id: string; threadId: string; time: number; field: Field; value: unknown };
const blank = (): ConversationState => ({ messages: [], draft: '', busy: false, status: '', hasStarted: false, evidenceOpen: false });

export function conversationTitle(prompt: string) {
  if (prompt.toLowerCase() === ASSESSMENT_PROMPT.toLowerCase()) return 'Marcus · Discovery coaching';
  return prompt.replace(/\s+/g, ' ').trim().slice(0, 64) || 'New conversation';
}
function validMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const m = value as ChatMessage;
  return typeof m.id === 'string' && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string' && typeof m.complete === 'boolean' &&
    (m.label === undefined || typeof m.label === 'string') && (!m.card || (typeof m.card.rep === 'string' && typeof m.card.summary === 'string' && typeof m.card.period === 'string' && typeof m.card.nextStep === 'string' && Array.isArray(m.card.rows) && m.card.rows.every(r => r && typeof r.id === 'string' && typeof r.skill === 'string' && typeof r.evidence === 'string' && Number.isFinite(r.score))));
}
function validThread(value: unknown): value is SavedConversation {
  if (!value || typeof value !== 'object') return false;
  const t = value as SavedConversation;
  return typeof t.id === 'string' && typeof t.title === 'string' && typeof t.pinned === 'boolean' && Number.isFinite(t.updatedAt) && !!t.state && typeof t.state.draft === 'string' && typeof t.state.evidenceOpen === 'boolean' && Array.isArray(t.state.messages) && t.state.messages.every(validMessage);
}
function validChange(value: unknown): value is Change {
  if (!value || typeof value !== 'object') return false;
  const c = value as Change;
  if (typeof c.id !== 'string' || typeof c.threadId !== 'string' || !Number.isFinite(c.time)) return false;
  switch (c.field) {
    case 'create': return validThread(c.value) && c.value.id === c.threadId;
    case 'delete': return c.value === true;
    case 'message': return validMessage(c.value);
    case 'draft': return typeof c.value === 'string';
    case 'name': return typeof c.value === 'string' && !!c.value.trim();
    case 'pinned': case 'evidenceOpen': return typeof c.value === 'boolean';
    case 'updatedAt': return typeof c.value === 'number' && Number.isFinite(c.value);
    case 'reading': return !!c.value && typeof c.value === 'object' && Number.isFinite((c.value as {top:number}).top) && typeof (c.value as {follow:boolean}).follow === 'boolean';
    default: return false;
  }
}

/** Immutable, uniquely keyed batches prevent one tab from overwriting another.
 * Each field has its edit-time order; scrolling can never overwrite a draft.
 * Delete tombstones win over late response events. The legacy snapshot is read-only.
 */
export function createConversationLibrary(layout: AssistantLayout, storage?: Storage, stream?: AnswerStream) {
  const legacyKey = `aria-conversations-v1-${layout}`;
  const prefix = `aria-conversations-v2-${layout}:`;
  const controllers = new Map<string, Controller>();
  const unsubscribes = new Map<string, () => void>();
  const listeners = new Set<() => void>();
  const seed = new Map<string, SavedConversation>();
  const changes = new Map<string, Change>();
  const loadedKeys = new Set<string>();
  const pending = new Map<string, Change>();
  const ephemeral = new Map<string, SavedConversation>();
  const localStreams = new Set<string>();
  const interrupted = new Map<string, ChatMessage>();
  let clock = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let applying = false;
  let savedActiveId = '';
  let snapshot: LibrarySnapshot = { activeId: '', threads: [], storageError: !storage };
  const notify = () => listeners.forEach(listener => listener());
  const fail = () => { snapshot = { ...snapshot, storageError: true }; notify(); };

  function queue(threadId: string, field: Field, value: unknown, suffix = '') {
    clock = Math.max(Date.now(), clock + 1);
    const change: Change = { id: crypto.randomUUID(), threadId, time: clock, field, value };
    pending.set(`${threadId}:${field}:${suffix}`, change);
    if (!timer) timer = setTimeout(flush, 200);
  }
  function flush() {
    clearTimeout(timer); timer = undefined;
    if (!pending.size) return;
    const batch = [...pending.values()];
    try {
      if (storage) {
        const key = `${prefix}batch:${crypto.randomUUID()}`;
        storage.setItem(key, JSON.stringify(batch));
        loadedKeys.add(key);
        if (savedActiveId !== snapshot.activeId) {
          storage.setItem(`${prefix}active`, snapshot.activeId);
          savedActiveId = snapshot.activeId;
        }
      }
      batch.forEach(c => changes.set(c.id, c));
      pending.clear();
    } catch { fail(); }
  }
  function attach(thread: SavedConversation) {
    const controller = createConversationController(stream, thread.state);
    controllers.set(thread.id, controller);
    unsubscribes.set(thread.id, controller.subscribe(() => {
      if (applying) return;
      const previous = snapshot.threads.find(t => t.id === thread.id);
      if (!previous) return;
      const next = controller.getSnapshot();
      if (ephemeral.has(thread.id)) {
        queue(thread.id, 'create', ephemeral.get(thread.id));
        ephemeral.delete(thread.id);
      }
      for (const field of ['draft', 'evidenceOpen', 'reading'] as const) {
        if (JSON.stringify(previous.state[field]) !== JSON.stringify(next[field]) && next[field] !== undefined) queue(thread.id, field, next[field]);
      }
      next.messages.forEach(message => {
        if (previous.state.messages.find(m => m.id === message.id) !== message) queue(thread.id, 'message', message, message.id);
      });
      const updatedAt = next.messages.length !== previous.state.messages.length ? Date.now() : previous.updatedAt;
      if (updatedAt !== previous.updatedAt) queue(thread.id, 'updatedAt', updatedAt);
      if (next.busy) localStreams.add(thread.id); else localStreams.delete(thread.id);
      snapshot = { ...snapshot, threads: snapshot.threads.map(t => t.id === thread.id ? { ...t, state: next, updatedAt,
        title: t.renamed ? t.title : conversationTitle(next.messages.find(m => m.role === 'user')?.text ?? next.draft) } : t) };
      notify();
      // Completed replies are durable immediately; drafts and scrolling are batched.
      if (previous.state.busy !== next.busy) flush();
    }));
  }
  function rebuild(initial = false) {
    const records = new Map([...seed].map(([id, t]) => [id, { ...t, state: { ...t.state, messages: [...t.state.messages] } }]));
    const deleted = new Set<string>();
    const ordered = [...changes.values(), ...pending.values()].sort((a,b) => a.time - b.time || a.id.localeCompare(b.id));
    for (const c of ordered) {
      clock = Math.max(clock, c.time);
      if (c.field === 'delete') { deleted.add(c.threadId); records.delete(c.threadId); continue; }
      if (deleted.has(c.threadId)) continue;
      if (c.field === 'create') { if (!records.has(c.threadId)) { const t=c.value as SavedConversation; records.set(t.id, {...t, state:{...t.state,messages:[...t.state.messages]}}); } continue; }
      const t = records.get(c.threadId);
      if (!t) continue;
      switch (c.field) {
        case 'name': t.title = c.value as string; t.renamed = true; break;
        case 'pinned': t.pinned = c.value as boolean; break;
        case 'updatedAt': t.updatedAt = c.value as number; break;
        case 'draft': t.state.draft = c.value as string; break;
        case 'evidenceOpen': t.state.evidenceOpen = c.value as boolean; break;
        case 'reading': t.state.reading = c.value as ConversationState['reading']; break;
        case 'message': {
          const message = c.value as ChatMessage;
          const index = t.state.messages.findIndex(m => m.id === message.id);
          if (index < 0) t.state.messages.push(message); else t.state.messages[index] = message;
          break;
        }
      }
    }
    for (const [id,t] of ephemeral) if (!deleted.has(id)) records.set(id,t);
    for (const t of records.values()) {
      t.state.hasStarted = t.state.messages.length > 0;
      if (initial) t.state.messages.forEach(m => { if (m.role === 'assistant' && !m.complete) interrupted.set(m.id, m); });
      t.state.messages = t.state.messages.map(m => interrupted.get(m.id) === m ? {...m,label:'Response interrupted',text:m.text || 'This response was interrupted. You can send your question again.'} : m);
      t.state.busy = !initial && t.state.messages.some(m => m.role === 'assistant' && !m.complete && m.label !== 'Response interrupted');
      t.state.status = t.state.busy ? 'Reply in progress in another tab…' : '';
      if (t.state.messages.some(m => m.label === 'Response interrupted')) t.state.status = 'Response interrupted by page reload.';
      if (!t.renamed) t.title = conversationTitle(t.state.messages.find(m => m.role === 'user')?.text ?? t.state.draft);
      // Other tabs' reading position does not move this tab's active transcript.
      const current = snapshot.threads.find(item => item.id === t.id);
      if (!initial && current) t.state.reading = current.state.reading;
      if (localStreams.has(t.id) && current) {t.state.busy=current.state.busy;t.state.status=current.state.status;}
    }
    applying = true;
    for (const [id,controller] of controllers) if (!records.has(id)) {
      unsubscribes.get(id)?.(); unsubscribes.delete(id); controller.dispose(); controllers.delete(id); localStreams.delete(id);
    }
    for (const t of records.values()) {
      if (controllers.has(t.id)) controllers.get(t.id)!.replaceState(t.state); else attach(t);
    }
    applying = false;
    snapshot = { ...snapshot, threads: [...records.values()] };
    if (!records.has(snapshot.activeId)) snapshot.activeId = '';
    if (!snapshot.activeId) create();
    notify();
  }
  function sync() {
    if (!storage) return;
    let changed = false;
    try {
      for (let i=0;i<storage.length;i++) {
        const key=storage.key(i);
        if (!key?.startsWith(`${prefix}batch:`) || loadedKeys.has(key)) continue;
        const batch: unknown = JSON.parse(storage.getItem(key) ?? 'null');
        if (!Array.isArray(batch) || !batch.every(validChange)) throw Error('Invalid saved changes');
        batch.forEach(c=>changes.set(c.id,c)); loadedKeys.add(key); changed=true;
      }
      if (changed) rebuild();
    } catch { fail(); }
  }
  function create() {
    const empty = snapshot.threads.find(t => !t.state.hasStarted && !t.state.draft.trim());
    if (empty) { snapshot = {...snapshot,activeId:empty.id}; notify(); return empty.id; }
    const thread: SavedConversation = {id:crypto.randomUUID(),title:'New conversation',renamed:false,pinned:false,updatedAt:Date.now(),state:blank()};
    ephemeral.set(thread.id,thread);
    snapshot = {...snapshot,activeId:thread.id,threads:[...snapshot.threads,thread]}; attach(thread); notify(); return thread.id;
  }
  try {
    const raw=storage?.getItem(legacyKey);
    if (raw) {
      const data=JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.threads)) throw Error('Invalid legacy history');
      data.threads.filter(validThread).forEach((t:SavedConversation)=>seed.set(t.id,t));
      snapshot.activeId=data.activeId;
    }
    sync();
    snapshot.activeId=storage?.getItem(`${prefix}active`) ?? snapshot.activeId;
    rebuild(true);
  } catch { fail(); if(!snapshot.activeId || !controllers.has(snapshot.activeId)) {snapshot.activeId='';create();} }

  function select(id: string) {
    if (!controllers.has(id)) return;
    flush(); snapshot={...snapshot,activeId:id};
    try {storage?.setItem(`${prefix}active`,id);savedActiveId=id;} catch {fail();}
    notify();
  }
  return {
    getSnapshot: () => snapshot,
    subscribe(listener:()=>void) {listeners.add(listener);return ()=>{listeners.delete(listener);};},
    controller: (id:string) => controllers.get(id)!,
    create, select, flush, sync,
    rename(id:string,title:string) {
      if (!title.trim()) return;
      queue(id,'name',title.trim().slice(0,80)); flush(); rebuild();
    },
    pin(id:string,pinned:boolean) {queue(id,'pinned',pinned);flush();rebuild();},
    remove(id:string) {queue(id,'delete',true);flush();rebuild();},
    isStorageKey(key:string|null) {return key === null || key.startsWith(prefix);},
  };
}
