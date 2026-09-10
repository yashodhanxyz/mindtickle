# Design decisions

The original README defines the assignment. I prioritised a coherent first answer, inspectable coaching evidence, and a conversation Jordan can leave and resume while working. The fixed stream and coaching payload remain unchanged. One disclosure reveals all three evidence snippets, keeping the initial card concise.

Two separate pages support comparison: `/floating` attaches chat to the viewport bottom; `/column` reflows the workspace beside it. There is no presentation selector inside either experience. Closing and reloading preserve conversations and drafts on this browser; floating chat also offers a compact minimise bar. Both use a full-height dialog on phones. The column takes this form below 1,100 pixels, while floating chat remains available down to 761 pixels.

Conversation history is the chosen enhancement: Jordan can separate coaching and deal preparation, rename useful threads, pin recurring work, and delete with confirmation. One thread is visible at a time; separate stores keep the two concepts comparable. Responses belong to thread IDs, so switching cannot send an answer to the wrong conversation. New entity questions use bounded context, while the original question retains the fixed stream.

Shared entity context connects the answer to the workspace. Marcus, Lena, Didi, Brookfield, and Percepto use one typed registry and the same quick-view component in both places. Inline names are understated text buttons; host names keep the supplied chip styling. Added content is labelled fictional demo context. Research informed useful discovery questions and deal fields, without inventing scored assessments or call records for other reps.

Stable dimensions and a separate scrolling transcript keep the composer anchored. Brief entrance and card motion communicate hierarchy; reduced motion removes animation and preview transitions. Quick views use the browser's top layer, with keyboard entry, Escape, outside dismissal, and focus restoration. On mobile they remain within the owning dialog's accessible tree. Meaningful status announcements avoid reading every streamed chunk.

AI helped with research, concepts, implementation, and review. I overrode its original one-way proposals, separated the presentations, and corrected unsupported content and focus/scroll regressions through testing. Follow-ups remain visibly labelled local demo replies. Next I would choose one presentation through comparative usability testing, validate with screen readers and physical phones, then consider a grounded model integration.

See [design-qa.md](design-qa.md) for checks and limits.
