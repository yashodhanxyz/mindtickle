import { useState, useSyncExternalStore } from 'react';
import { createConversationLibrary } from './conversationLibrary';
import type { AssistantLayout } from './pages';

export function useConversation(layout: AssistantLayout) {
  // Assignment previews deliberately start clean after every page refresh so
  // reviewers can replay the experience without clearing browser storage.
  const [library] = useState(() => createConversationLibrary(layout));
  const snapshot = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot);
  const controller = library.controller(snapshot.activeId);
  const thread = snapshot.threads.find(t => t.id === snapshot.activeId)!;
  return { ...thread.state, id: thread.id, title: thread.title, library, history: snapshot,
    setDraft: controller.setDraft, setEvidenceOpen: controller.setEvidenceOpen, setReading: controller.setReading, send: controller.send };
}
