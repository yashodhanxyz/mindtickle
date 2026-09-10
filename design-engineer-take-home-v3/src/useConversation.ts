import { useState, useSyncExternalStore } from 'react';
import { createConversationLibrary } from './conversationLibrary';
import type { AssistantLayout } from './pages';

export function useConversation(layout: AssistantLayout) {
  const [library] = useState(() => {
    let storage: Storage | undefined;
    try { storage = window.localStorage; } catch { /* The conversation still works in memory. */ }
    return createConversationLibrary(layout, storage);
  });
  const snapshot = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot);
  const controller = library.controller(snapshot.activeId);
  const thread = snapshot.threads.find(t => t.id === snapshot.activeId)!;
  return { ...thread.state, id: thread.id, title: thread.title, library, history: snapshot,
    setDraft: controller.setDraft, setEvidenceOpen: controller.setEvidenceOpen, setReading: controller.setReading, send: controller.send };
}
