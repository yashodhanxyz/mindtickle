import { useEffect, useState, useSyncExternalStore } from 'react';
import { createConversationLibrary } from './conversationLibrary';
import type { AssistantLayout } from './pages';

export function useConversation(layout: AssistantLayout) {
  const [library] = useState(() => {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* The conversation still works in memory. */ }
    return createConversationLibrary(layout, storage);
  });
  useEffect(() => {
    const sync = (event: StorageEvent) => { if (library.isStorageKey(event.key)) library.sync(); };
    const flush = () => library.flush();
    const visibility = () => { if (document.visibilityState === 'hidden') flush(); else library.sync(); };
    window.addEventListener('storage', sync);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);
    library.sync();
    return () => {
      flush();
      window.removeEventListener('storage', sync);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [library]);
  const snapshot = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot);
  const controller = library.controller(snapshot.activeId);
  const thread = snapshot.threads.find(t => t.id === snapshot.activeId)!;
  return { ...thread.state, id: thread.id, title: thread.title, library, history: snapshot,
    setDraft: controller.setDraft, setEvidenceOpen: controller.setEvidenceOpen, setReading: controller.setReading, send: controller.send };
}
