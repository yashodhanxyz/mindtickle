import { createConversationController, ASSESSMENT_PROMPT, type AnswerStream, type ConversationState } from './conversation';
import type { AssistantLayout } from './pages';

type Controller = ReturnType<typeof createConversationController>;
export type SavedConversation = { id: string; title: string; renamed: boolean; pinned: boolean; updatedAt: number; state: ConversationState };
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem'>;
export type LibrarySnapshot = { activeId: string; threads: SavedConversation[]; storageError: boolean };
const blank = (): ConversationState => ({ messages: [], draft: '', busy: false, status: '', hasStarted: false, evidenceOpen: false });
export function conversationTitle(prompt: string) {
  if (prompt.toLowerCase() === ASSESSMENT_PROMPT.toLowerCase()) return 'Marcus · Discovery coaching';
  return prompt.replace(/\s+/g, ' ').trim().slice(0, 64) || 'New conversation';
}
function validState(value: unknown): value is ConversationState {
  if (!value || typeof value !== 'object') return false;
  const s = value as ConversationState;
  return typeof s.draft === 'string' && typeof s.evidenceOpen === 'boolean' && Array.isArray(s.messages) && s.messages.every(m =>
    m && typeof m.id === 'string' && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string' && typeof m.complete === 'boolean' &&
    (!m.card || (typeof m.card.rep === 'string' && typeof m.card.summary === 'string' && typeof m.card.period === 'string' && typeof m.card.nextStep === 'string' && Array.isArray(m.card.rows) && m.card.rows.every(r => typeof r.id === 'string' && typeof r.skill === 'string' && typeof r.evidence === 'string' && typeof r.score === 'number'))));
}
/** Each response belongs to a controller keyed by thread ID, never to the selected row. */
export function createConversationLibrary(layout: AssistantLayout, storage?: Storage, stream?: AnswerStream) {
  const key = `aria-conversations-v1-${layout}`;
  const controllers = new Map<string, Controller>();
  const unsubscribes = new Map<string, () => void>();
  const listeners = new Set<() => void>();
  let snapshot: LibrarySnapshot = { activeId: '', threads: [], storageError: !storage };
  const publish = () => {
    try { storage?.setItem(key, JSON.stringify({ version: 1, activeId: snapshot.activeId, threads: snapshot.threads })); }
    catch { snapshot = { ...snapshot, storageError: true }; }
    listeners.forEach(listener => listener());
  };
  function attach(thread: SavedConversation) {
    const controller = createConversationController(stream, thread.state);
    controllers.set(thread.id, controller);
    unsubscribes.set(thread.id, controller.subscribe(() => {
      const next = controller.getSnapshot();
      snapshot = { ...snapshot, threads: snapshot.threads.map(item => item.id !== thread.id ? item : {
        ...item, state: next,
        title: item.renamed ? item.title : conversationTitle(next.messages.find(m => m.role === 'user')?.text ?? next.draft),
        updatedAt: next.messages.length !== item.state.messages.length ? Date.now() : item.updatedAt,
      }) };
      publish();
    }));
  }
  try {
    const raw = storage?.getItem(key);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.version !== 1 || !Array.isArray(data.threads)) throw Error('Invalid saved conversations');
      const ids = new Set<string>();
      const threads: SavedConversation[] = data.threads.filter((t: SavedConversation) => t && typeof t.id === 'string' && !ids.has(t.id) && !!ids.add(t.id) && typeof t.title === 'string' && typeof t.pinned === 'boolean' && typeof t.updatedAt === 'number' && validState(t.state)).map((t: SavedConversation) => ({
        ...t, renamed: !!t.renamed,
        state: { ...t.state, busy: false, hasStarted: t.state.messages.length > 0, status: t.state.busy ? 'Response interrupted by page reload.' : '',
          reading: t.state.reading && Number.isFinite(t.state.reading.top) ? {top: Math.max(0, t.state.reading.top), follow: !!t.state.reading.follow} : undefined,
          messages: t.state.messages.map(m => m.role === 'assistant' && !m.complete ? {...m, label: 'Response interrupted', text: m.text || 'This response was interrupted. You can send your question again.'} : m) },
      }));
      snapshot = { ...snapshot, threads, activeId: threads.some(t => t.id === data.activeId) ? data.activeId : threads[0]?.id ?? '' };
      threads.forEach(attach);
    }
  } catch { snapshot = { ...snapshot, storageError: true }; }
  function create() {
    const empty = snapshot.threads.find(t => !t.state.hasStarted && !t.state.draft.trim());
    if (empty) {
      if (snapshot.activeId !== empty.id) { snapshot = { ...snapshot, activeId: empty.id }; publish(); }
      return empty.id;
    }
    const thread: SavedConversation = { id: crypto.randomUUID(), title: 'New conversation', renamed: false, pinned: false, updatedAt: Date.now(), state: blank() };
    snapshot = { ...snapshot, activeId: thread.id, threads: [...snapshot.threads, thread] };
    attach(thread); publish(); return thread.id;
  }
  if (!snapshot.activeId) create();
  const change = (id: string, patch: Partial<SavedConversation>) => { snapshot = { ...snapshot, threads: snapshot.threads.map(t => t.id === id ? { ...t, ...patch } : t) }; publish(); };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    controller: (id: string) => controllers.get(id)!,
    create,
    select(id: string) { if (controllers.has(id)) { snapshot = { ...snapshot, activeId: id }; publish(); } },
    rename(id: string, title: string) { if (title.trim()) change(id, { title: title.trim().slice(0, 80), renamed: true }); },
    pin(id: string, pinned: boolean) { change(id, { pinned }); },
    remove(id: string) {
      unsubscribes.get(id)?.(); unsubscribes.delete(id); controllers.get(id)?.dispose(); controllers.delete(id);
      snapshot = { ...snapshot, threads: snapshot.threads.filter(t => t.id !== id), activeId: snapshot.activeId === id ? '' : snapshot.activeId };
      if (!snapshot.activeId) create(); else publish();
    },
  };
}
