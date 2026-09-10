# Entity context research — 10 September 2026

The assignment and starter are authoritative for company, people, dates, and coaching evidence. All five entities are fictional. External research informs useful content, not facts about these people or deals; the real company named Percepto is not a source for the fictional opportunity.

## Content basis

[Salesforce's discovery-call guide](https://www.salesforce.com/blog/sales/what-is-a-discovery-call/) describes discovery around buyer needs, measurable success, business impact, decision participants, budget authority, approval steps, and a clear next action. These themes fit the README's autonomous-drone security scenario.

| Entity | Existing fixture retained | Authored demo extension and rationale |
|---|---|---|
| Marcus Bell | Account executive, mid-market, six calls this quarter, two coaching moments, Brookfield in evaluation | Next step uses the supplied coaching card verbatim. |
| Lena Ortiz | Recent calls ready; check-in today | Role context and a suggested question about what a successful security pilot would demonstrate and how to measure it. A suggestion, not an observed performance claim. |
| Didi Rao | Recent calls ready; check-in today | Role context and a suggested question about operational impact, urgency, and ownership of the next step. No invented call count or score. |
| Brookfield | Enterprise opportunity, evaluation, September 9 meeting, security review scheduled | Confirm operational/legal validators with Marcus; directly related to the supplied next step. |
| Percepto | Friday pricing follow-up | Enterprise opportunity and pricing-discussion stage are authored demo context. Next step checks scope, budget owner, and approval process before revising the proposal. |

Rep cards share availability/coaching fields; deal cards share stage/meeting fields. Every card has context and a suggested next step. `src/entities.ts` is shared by host cards, chat cards, and guided entity replies. Unsupported requests for transcripts or another rep's scores retain an explicit boundary.

## Interaction references

- [WCAG: Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html): additional content should be dismissible, hoverable, and persistent. Previews allow pointer travel into the card, pinning, keyboard access, Escape, and outside dismissal.
- [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/): interactive hover content belongs in a nonmodal dialog. These previews have a close control and use dialog semantics.
- [MDN Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using): the top layer avoids clipping behind chat. Manual popovers with explicit dismissal avoid focus races between hover opening and native light dismissal. Portals keep chat previews inside the mobile dialog's DOM subtree.

## Mobbin check

Searched web CRM/contact-preview patterns and inspected returned images. [Telegram user info](https://mobbin.com/screens/b209243e-c6b1-44e7-9e33-58f5fbdd6fdd) provides adjacent conversation/person context, a useful general relationship rather than a styling target. The returned [Dropbox Dash screen](https://mobbin.com/screens/df152781-336b-4860-bfa4-4d35f7347261) was a theme menu and did not support contact-card decisions. The existing Aria quick view remains the visual source of truth.

This is reference research and a prototype content model, not user research or validation of sales outcomes.
