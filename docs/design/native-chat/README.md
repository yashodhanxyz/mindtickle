# Native chat treatment — 11 September 2026

The conversation surface now relies on Aria's existing shell, typography, entities, and coaching artifacts for identity. The repeated Aria logo, “AI Assistant” heading, and conversation title were removed from the visible chat header. Assistant-response logos were also removed so answers share the panel's content edge.

The conversation title remains in sidebar history, where it supports retrieval, rename, pin, and delete tasks. The open chat retains a screen-reader heading, “Conversation,” plus hidden “Assistant response” labels, so removing visual chrome does not remove structure. Column mode keeps Close; floating mode keeps Minimize and Close. The minimized state now says “Resume conversation” and uses the existing Sparkles icon instead of another Aria logo.

This follows the context-led pattern found in integrated work assistants: Notion Agent uses the current page or selected blocks as context, while Microsoft describes Copilot Chat as operating side by side with the host application. Mobbin references also show chat as a workspace region rather than a separately branded product: [Gemini Notebook](https://mobbin.com/screens/55612d89-063b-46b8-82f9-407d14476330) and [Dropbox Dash](https://mobbin.com/screens/1258460d-e426-4684-963c-27b67e994ab0).

## Verification

- Compared the integrated-column before and after captures at the same desktop viewport and conversation state.
- Verified no Aria logo remains inside either chat surface.
- Verified column has Close only and floating has Minimize and Close.
- Verified the 390 × 844 column chat fills the viewport without horizontal overflow; its header is 61 px including safe-area-aware padding.
- Verified the minimized floating state exposes “Restore conversation,” “Resume conversation,” and “Close conversation.”
- All 25 tests and the production build pass.

Screenshots: [column before](column-before.jpg), [column after](column-after.jpg), [floating after](floating-after.jpg), and [mobile after](mobile-after.jpg).

Physical screen-reader and physical-device checks remain outside this browser pass.
