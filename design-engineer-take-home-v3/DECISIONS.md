# Design decisions

The [README](README.md) defines the assignment. I prioritised a coherent first answer, inspectable coaching evidence, and a conversation Jordan can leave and resume while working. The original fixed stream and coaching data remain unchanged. One disclosure reveals the three supporting evidence snippets together, keeping the card readable before Jordan requests more detail.

Two presentations share the same conversation. The floating chat attaches to the bottom of the viewport; minimising leaves a compact restore bar, while closing returns Jordan to the host entry point. The integrated third column reflows the host content beside the conversation. Switching between them preserves messages, the unsent draft, evidence state, and reading position. App-owned session state outlives either surface; reloading starts over. At mobile widths (760 pixels or less), both use a full-height conversation. The column also uses this form below 1,100 pixels; floating chat remains available on smaller desktops.

The shell integration is deliberately small: space for the third column and an entry point that becomes Resume conversation after closing. Floating chat is the default; switching lives in the chat header so Jordan can ask first. On phones both layouts converge, so the header keeps only minimize and close. The provided host, tokens, font, and logo remain the foundation.

Stable surface dimensions and a separate scrolling transcript let the answer grow without moving the composer. Brief entrance and card motion communicate hierarchy; reduced motion removes animation while retaining the same state changes. Keyboard focus moves intentionally on opening, minimising, and closing. Assistive technology receives meaningful progress and completion announcements rather than every streamed chunk.

Continued conversation is the scoped enhancement. Follow-ups use a visibly labelled, local guided demo grounded in the supplied assessment. It is not a connected model; there is no backend or saved conversation history. Unsupported requests receive an honest boundary instead of invented call records.

AI helped with reference research, concepts, implementation, and review. I overrode its initial one-way modal proposals, corrected generated host dates and unsupported timestamps, and bounded follow-up content. Next I would choose one presentation after comparative usability testing and validate a grounded model integration separately.

Validation evidence and remaining limitations are recorded in [design-qa.md](design-qa.md).
