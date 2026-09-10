import { useState, useSyncExternalStore } from "react";
import { createConversationController } from "./conversation";

export function useConversation() {
  // No work starts during render/effects, so StrictMode cannot replay a submission.
  const [controller] = useState(createConversationController);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  return {
    ...state,
    setDraft: controller.setDraft,
    setEvidenceOpen: controller.setEvidenceOpen,
    send: controller.send,
  };
}
