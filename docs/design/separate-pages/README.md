# Separate option pages and shared quick views

10 September 2026. Current implementation; older documents describe the mixed-layout version.

## Try it

Start the app as described in the root README. Open `/floating` or `/column` on the printed server URL. The existing local preview uses port 5174. Each URL opens the provided host and fixed question, with its own presentation after invocation. No layout switch appears inside the product. `/` aliases floating. Reloading or changing pages starts a new demo session.

1. Open any of the five names in the brief with pointer, keyboard focus, or Arrow Down. Enter/Space also enters a focused quick view. Escape returns to its trigger; clicking outside dismisses it.
2. Ask the preset Marcus question. Read the original streamed answer and disclose the three evidence snippets.
3. Open Marcus or Brookfield in the answer/card. Ask `Tell me about Lena Ortiz`, `Tell me about Didi Rao`, or `Tell me about Percepto` to see matching context and quick views in chat.
4. Enter a draft. Minimise floating chat, restore it, close it, then resume from the entry point. Draft and transcript survive. Column has close/resume on desktop; mobile also offers minimise.

Host and chat cards share one typed registry. Added content is explicitly fictional and [research-informed](../../research/entity-context.md). The original assignment README and mock remain unmodified.

## Verification

| Page | Actual CSS viewport | Result |
|---|---|---|
| Floating | 1440 × 900 | Passed |
| Column | 1440 × 900 | Passed |
| Floating | 390 × 844 | Passed |
| Column | 390 × 844 | Passed |
| Floating | 320 × 568 | Passed |
| Column | 320 × 568 | Passed |

Every matrix run checks all five host previews via keyboard, all five chat previews by click, identical host/chat content, bounds, preview Escape without closing chat, three evidence snippets, close/resume focus, draft retention, no horizontal document overflow, stationary surface/header, and fresh browser errors. Mobile also checks forward/reverse Tab containment and minimise/restore. [Raw results](qa-results.json) record actual dimensions and outcomes. Desktop conversations expose a region; mobile exposes a modal dialog.

`npm test`: 12 passed. `npm run build`: passed, including TypeScript. Tests cover fixed stream order/content, session lifecycle and interruptions, entity text preservation, peer-field parity, bounded replies, and route selection. Source review confirms a separate polite atomic status region, no per-chunk live announcements, reduced-motion overrides, and no drop-in chat kit.

Fixed during this pass: focus reentry in native auto popovers; first-click dismissal after hover; previews behind chat; focus-scroll dismissing a narrow-screen preview; and overflowing screen-reader labels allowing the outer chat to scroll its header away. Manual top-layer popovers, explicit dismissal, scoped positioning, and transcript containment resolve these.

## Visual review

The [original host](before-host.jpg) and [updated host](after-host.jpg) were viewed together at 1256 × 1204, same resumed workspace and Marcus details. The preview intentionally grows from 288 to 320 pixels to fit a next step, close control, and provenance. Typography, avatar, surfaces, spacing, radius, and shadow use original host styles. Focus moves into the dialog on deliberate keyboard entry. Added chips make peer access consistent; no shell redesign was introduced.

- [Floating desktop](floating-1440-answer.jpg) / [column desktop](column-1440-answer.jpg)
- [Floating mobile](floating-390-answer.jpg) / [column mobile](column-390-answer.jpg)
- [Floating mobile preview](floating-390-preview.jpg) / [column mobile preview](column-390-preview.jpg)
- [Floating 320](floating-320-answer.jpg) / [column 320](column-320-answer.jpg)

Final captures were inspected for typography, density, wrapping, aligned scores, chrome, and controls. Mobile shows a scrolling transcript; earlier content can be above its visible boundary. Captures use CSS viewport dimensions at density 1; no scaling or pixel-diff score is claimed. Exploratory captures in this folder are not final evidence.

## Limits and submission guidance

Follow-ups are local authored replies, not a connected model. No scoring scale, new call evidence, backend, or reload persistence is invented. Browser interaction and DOM semantics were checked; actual VoiceOver/NVDA speech, physical touch/IME/software keyboard, OS reduced-motion switching, forced colors, and a full numerical contrast audit were not exercised. Pointer entry was exercised incidentally during clicks; dedicated slow-hover traversal remains a manual check. This is not a claim of full WCAG conformance.

The README's suggested public preview and presentation recording remain submission preparation tasks. The working local preview and concise DECISIONS.md are available; no public deployment was requested in this pass.
