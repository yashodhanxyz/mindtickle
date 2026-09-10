# Current refinement — minimise only floating chat

11 September 2026. The column header now has Close only, on desktop and mobile. Floating retains Minimize and Close. Column users close/resume to return to their workspace; drafts and history remain saved. Verified the column header in the browser and the TypeScript/production build.

---

# Current QA — simplified chat headers

11 September 2026. Removed the New and Conversations buttons from both chat headers. Both now expose only Minimize and Close, including the desktop column. New/history remain available through the sidebar and command menu; on mobile, minimise or close chat to access the host controls. Verified both header button lists, minimise/restore, close/Escape focus return, and the TypeScript/production build. No conversation state or mock changes.

---

# Current QA — command menu and sidebar refinement

10 September 2026. Removed the visible AI conversations heading and cleared the preview test pin. Search now opens a working Command K / Control K command menu with saved-chat search and a keyboard guide. Desktop and both mobile widths passed; 17 tests and the production build pass. [Review, visual evidence, checks, and limits](../docs/design/shortcuts/README.md).

---

# Current QA — multiple saved conversations

10 September 2026. Both options passed the scoped conversation-history review. [Implementation, captures, tests, and limitations](../docs/design/conversation-history/README.md) supersede the historical session limits below.

New, revisit, rename, pin/unpin, delete/cancel, drafts, reload, thread-specific streaming, evidence, and reading-position restoration were checked. Both routes passed desktop 1440 × 900 and mobile 390 × 844 / 320 × 568. Keyboard checks cover menus, nested Escape dismissal, focus restoration, mobile chat/history containment, and compact-sidebar history access. The latter initially hid overlay content through an overly broad selector; the selector is now scoped to the sidebar and the flow was rechecked.

Before/after captures for each desktop option were opened together at 1440 × 900, completed Marcus answer with evidence collapsed and composer focused. Font, neutral surfaces, geometry, card, scores, and supplied logo remain consistent. Intentional additions are sidebar history, New/Conversations controls, and the thread title. Mobile captures show readable history and an unclipped empty-state heading. No unresolved visual defect was found in the inspected states.

17 unit tests and the production/TypeScript build pass. Original assignment README and mock remain unchanged. Browser-only verification does not establish full WCAG conformance; screen-reader speech and physical phones remain untested.

---

# Current QA — separate pages and shared entity context

10 September 2026. Reviewed with the Product Design workflow. **The separate-page implementation passes the scoped checks.** See [current QA, captures, and limitations](../docs/design/separate-pages/README.md) and [research](../docs/research/entity-context.md).

Both routes passed at 1440 × 900, 390 × 844, and 320 × 568 CSS pixels. All five entity previews have equal host/chat content. Evidence disclosure, preview dismissal, Escape layers, restored focus, drafts, mobile focus containment, and viewport bounds passed. No new browser errors occurred in the six final matrix runs. Twelve unit tests and the TypeScript/production build passed. Original README and mock are unchanged.

The original and updated host captures were opened together at the same 1256 × 1204 viewport and resumed state. Existing font, avatar, tokens, card treatment, neutral colors, and icon family remain consistent. Intentional differences are peer chips, a wider card, next step, provenance, close control, and focus moving into the dialog. Desktop/mobile captures confirm fixed header/composer, readable body text, score alignment, and responsive wrapping. No unresolved visual defect was identified in the inspected states. Accessibility limits are explicitly recorded in the linked report; this is not a full conformance certification.

## Hover sequence regression — 10 September 2026

The shared 300 ms hover lockout could be restarted by a delayed close from an already-replaced card. Entering the next name during that window produced no preview. Removed the timed lockout, cancel pending close timers when a native popover closes, and ignore close requests for already-closed cards. Explicit dismissal waits only for real pointer movement before rearming hover; ordinary leave/blur does not suppress other names.

Verified pointer traversal through Marcus → Lena → Didi → Lena → Marcus, and Brookfield → Percepto → Brookfield → Percepto. Each step showed exactly the expected card, and the final card remained visible after earlier close timers would have elapsed. Browser automation used native pointer drags without clicking a name to exercise entry/movement/leave; a physical mouse-only pass remains useful. Keyboard Arrow Down, Tab to close, Escape restoration, and chat-preview Escape were also checked. All 12 tests and the production build pass.

---

## Historical QA for the earlier layout-switch version

# Design QA — two persistent conversation layouts

10 September 2026. Independent review using the Product Design design-qa skill.

**Findings**

No actionable P0, P1, or P2 differences remain in the reviewed captures. The floating conversation is attached to the bottom of the viewport, with minimize and close controls. The integrated option allocates a real third column and reflows the host. Both preserve the same conversation and draft.

This is a visual and implementation review of a guided prototype. It does not certify accessibility or establish that a general-purpose model is connected.

## Source of truth and comparison method

The [README](README.md), [unchanged mock](mock/streamAnswer.ts), existing host tokens/assets, [conversation specification](../docs/design/conversation-storyboards-2026-09-10.md), and the user's latest bottom-attachment/minimize/both-layout instruction take precedence over incidental generated-image differences.

| Surface | Source visual truth | Rendered implementation | State / viewport |
|---|---|---|---|
| Floating desktop | [Bottom-attached reference](../docs/design/assets/conversation-bottom-attached.png) | [Floating conversation](../docs/design/implementation/floating-three-turns.png) | Three completed exchanges, collapsed evidence, exact unsent draft; 1440 × 900 CSS px |
| Integrated desktop | [Column reference](../docs/design/assets/conversation-column-desktop.png) | [Column conversation](../docs/design/implementation/column-three-turns.png) | Same thread and draft; 1440 × 900 CSS px |
| Mobile resumed | Right-hand frame of [shared mobile board](../docs/design/assets/conversation-mobile-storyboard.png) | [Mobile resumed](../docs/design/implementation/mobile-resumed.png) | Three exchanges and draft, keyboard hidden; 390 × 844 CSS px |
| Narrow mobile regression | Same mobile conversation concept | [Before fix](../docs/design/implementation/mobile-320-before-fix.png), [after fix](../docs/design/implementation/mobile-320-fixed.png) | Same draft after width reduction; 320 × 568 CSS px |
| First answer | Left-hand frame of the shared mobile board, plus exact mock | [Floating first answer](../docs/design/implementation/floating-first-answer.png) | Narrative, complete card, collapsed evidence; 1440 × 900 CSS px; content comparison across different placements |
| Minimized | Latest user instruction; compact continuation of floating styling | [Desktop minimized](../docs/design/implementation/floating-minimized.png), [mobile minimized](../docs/design/implementation/mobile-minimized.png) | Bottom-attached restore bar and close control; 1440 × 900 and 320 × 568 CSS px |

Each source and implementation pair was opened together in the same comparison input. The mobile board and both 320 px regression captures were also viewed together. These were comparisons of actual image contents, not filenames or descriptions.

### Size, density, and normalization

- Both desktop source images are **1586 × 992 pixels**, generated for an intended 1440 × 900 composition. Geometric comparison uses approximately **0.908 source pixels-to-CSS scale**; this is an illustrative export scale, not a known browser device-pixel ratio. The implementation captures are **1440 × 900 pixels at 1440 × 900 CSS px**, density 1.
- The mobile source is a **1190 × 1322 pixel board with two app frames and exterior labels**. The intended frame target was 390 × 844 CSS px. Its generated frame dimensions and typography are approximate, so the right frame is a composition/content target, not a pixel oracle. Board title, labels, margins, and the left frame are excluded when comparing the resumed state.
- Mobile implementation captures are **390 × 844** and **320 × 568 pixels**, matching their CSS viewports at density 1. They contain the application viewport without browser chrome, hardware bezels, or software keyboard.
- Comparisons account for the scale difference; no pixel-diff score or exact raster match is claimed. Source assets were not stretched into the implementation.
- Desktop captures share the same three-turn state, but the visible top of the transcript differs because the implementation follows its actual scroll position. Earlier narrative/card content remains in the thread. A clipped fragment at the transcript's top boundary is scroll cropping, not deleted content.

### Full-view and focused-region evidence

Full-view comparison confirms the intended distinction: the floating panel covers part of the unchanged host; the column reduces the main content width, shows two upper statistic cards plus a full-width third card, and uses the full viewport height. Both keep the composer inside the conversation surface.

The reviewer separately inspected the header controls, each visible card score/label, evidence control, reply paragraphs, suggested-wording label, draft composer, focus ring, and minimized bar within the original-resolution combined image inputs. Those regions are legible at the supplied resolutions, so separate enlarged crop files were unnecessary. The first-answer capture provides the complete card detail absent from the scrolled desktop heroes. The narrow before/after pair provides direct focused evidence of the composer regression and correction.

## Required fidelity surfaces

| Surface | Evaluation | Classification |
|---|---|---|
| Fonts and typography | The implementation uses the supplied Inter Variable font with system fallbacks. Conversation body text is 15 px with a 1.55 line height; the mobile composer is 16 px. Header/card headings, 12 px context labels, regular body copy, and tabular scores retain distinct hierarchy. Original-resolution captures show clean glyphs, deliberate weight differences, readable wrapping, and no remaining clipped draft line. Generated reference glyphs and exact wrapping vary; the real host font is authoritative. | Acceptable. The 10 px demo caption is subordinate metadata; the full notice is also available through its title. A formal font-loading/fallback failure test was not part of this visual pass. |
| Spacing and layout rhythm | Floating width is 460 CSS px, bottom 0, with restrained rounded top corners and shadow. Root browser measurements confirm the integrated 1440 px grid as 240 / 740 / 460 px. Message gaps, card padding, aligned right-side scores, divider spacing, and composer separation are consistent. At 320 px, the corrected composer expands to show both draft lines and retains the send control. | Acceptable. The host's actual 240 px navigation and source padding supersede approximate generated geometry. |
| Colors and visual tokens | White conversation surfaces, neutral borders/shadows, pale indigo user bubbles, dark text, and the original primary accent match the host's token system. Scores have no unsupported red/green interpretation. Focus is visibly outlined in the inspected focused captures; disabled send and active send are distinguishable. | Acceptable visual contrast and state distinction in these captures; no numerical contrast audit or forced-colors test is claimed. |
| Image quality and asset fidelity | The supplied `/aria-logo.png` is retained for brand/assistant imagery. It appears sharp and correctly proportioned. Header, disclosure, layout, minimize, close, and send icons use the existing/standard icon library. No generated screenshot is embedded as a functional UI, and no logo is replaced with CSS art, text, or handcrafted SVG. | Acceptable. The real logo and standard arrow-up send icon take precedence over approximate generated marks and paper-plane icons. |
| Copy and content | The complete first-answer capture preserves Marcus Bell, Q3/six-call scope, the exact narrative, 4.1 / 3.8 / 2.9 scores, summary, and next step. The follow-up explanation and suggested wording match the storyboard. The draft remains solely in the composer. Evidence disclosure labels are explicit. No denominator, invented call link, timestamp, or new dataset is added. | Acceptable. The visible demo caption distinguishes authored, grounded prototype replies. The original September 4 fixture date is deliberately retained; the newer floating illustration's September 10 date is incidental generator drift. |

## Comparison and fix history

1. **[P2, resolved] Width-only resizing clipped an unsent draft.**
   - Location: composer sizing in `src/AssistantExperience.tsx`.
   - Evidence: `mobile-320-before-fix.png` shows the second line cut off inside a 40 px textarea. The mobile source expects the entire draft to remain readable.
   - Fix: track visual-viewport width and observe the textarea's width, recalculating its height when wrapping changes.
   - Post-fix evidence: `mobile-320-fixed.png` shows the same draft in a 64 px textarea, both lines fully visible, with the send button and focus ring intact. The reference, before, and after images were compared in one input.

2. **[P2, resolved] Host styles could override assistant integration styles.**
   - Earlier source review identified `assistant.css` loading before `styles.css`, allowing equal-specificity host rules to defeat container reflow, compact-sidebar mobile sizing, and reduced-motion scroll behavior.
   - Fix: `src/main.tsx` now imports `assistant.css` after `styles.css`.
   - Post-fix evidence: `column-three-turns.png` shows the intended two-plus-one statistic-card layout and wrapped central content. Source inspection confirms the final import order. The OS reduced-motion setting was not exercised in this review.

3. **[P2, resolved] Resizing could lose the reader's logical position.**
   - Earlier source review found that only message content was observed. Composer growth and width-only reflow could change the visible transcript without restoring bottom-following or the saved message anchor.
   - Fix: an anchor-aware resize observer watches both content and transcript dimensions; composer width changes trigger sizing updates.
   - Post-fix evidence: the narrow capture retains the latest reply above the expanded composer. Root's live check also measured close/resume at scrollTop **480 → 480**, with scrollHeight **1216** unchanged and the draft retained. Static captures alone do not prove every reflow path.

4. **[P2, resolved] Resuming an unchanged older reading position falsely indicated a new reply.**
   - Earlier source review found the indicator was set whenever the surface became active while scrolled upward.
   - Fix: compare the current messages with the last visible message state before setting the indicator.
   - Post-fix evidence: source inspection confirms the condition; root's live close/resume check reported `newReply: false` for an unchanged thread.

5. **Scope clarity correction.** The initial entry previously invited arbitrary questions while the supplied mock ignored them. The entry now displays the prescribed question as read-only with the label “Initial coaching question.” Follow-ups remain editable and explicitly use bounded demo responses.

These corrections include source-review findings as well as the captured visual regression. They are not represented as five separate pixel-comparison passes.

## Interaction evidence and test boundaries

Final responsive refinement: floating chat uses the full-screen form only at 760 CSS pixels or less. The column uses it below 1,100 pixels to protect the centre content. At the normal 936 × 1184 preview, root measured the floating panel at 460 × 760, right edge 912, bottom 1184, role `region`, with the host not inert. [Default-viewport capture](../docs/design/implementation/floating-default-viewport.png) records this state. An obscured duplicate entry control is hidden while this smaller-desktop floating panel is open; Escape restores and focuses Resume conversation. The final fresh-load error/warning filter remained empty.

The root agent reported these live browser checks; this independent review corroborated the visible states and inspected the relevant source:

- Both layouts show the same six messages and exact unsent draft; switching layout preserves the session.
- Floating chat is 460 px wide and attached at bottom 0. Minimize exposes a compact restore bar; closing it returns focus to Resume conversation.
- Closing before the first mock status does not abort the response. Resuming does not replay the initial question or create another card.
- Escape closes the active conversation and returns focus to the entry. At 390 × 844, the background is inert and Tab cycles within the full-screen conversation.
- Evidence toggles, close/resume, and the 320 px minimized state were exercised. The narrow minimized bar does not collide with a duplicate entry control.
- The final post-fix `npm test` passed **8 tests**, and `npm run build` passed, including `tsc -b`. `git diff --check` was clean.

The console history included three development/HMR errors during partial file writes and a changed effect dependency array during hot refresh. Those are historical development events; this report does not claim the entire console history was empty. After all source changes, root performed a fresh reload at 1440 × 900, selected Third column from the initial picker, submitted the prescribed question, and waited for the complete first answer. Error/warning logs filtered to timestamps at or after that clean reload returned **no entries**.

Physical-device software keyboards, VoiceOver/screen-reader announcement timing, OS reduced-motion settings, forced colors, and formal accessibility conformance were not exercised by this reviewer. The implementation has corresponding viewport, focus, status, and reduced-motion code, but source inspection is not a substitute for those checks. Error presentation is covered at the conversation-controller level, not by an independent rendered-error screenshot. No live model endpoint is connected.

**Open Questions**

- None blocking this prototype's visual handoff. General model-backed follow-ups, reload persistence, and multiple conversations remain outside the present guided-demo scope.

**Implementation Checklist**

- [x] Compare both desktop references and the shared mobile reference with rendered captures.
- [x] Inspect typography, spacing, tokens, asset fidelity, and exact coaching content.
- [x] Recompare the 320 px draft regression after its sizing correction.
- [x] Verify the final CSS import order, reading-position observer, and new-reply condition in source.
- [x] Retain the working minimize/close/restore flow and both layout options.
- [x] Record the final fresh-reload console result alongside the browser evidence.
- [ ] Before a production accessibility claim, test VoiceOver, physical software keyboards, enlarged text, and OS reduced motion.

**Follow-up Polish**

- [P3] Consider increasing the demo caption's text size if it needs to carry more of the explanation independently of the surrounding assignment documentation. It currently remains secondary and does not compete with the conversation.

**final result: passed**

## Review iteration — simplify entry and responsive controls

10 September 2026. This pass compares fresh before/after browser captures from the current review. The source of visual truth is the existing implementation plus the user's explicit request to remove the initial Floating chat / Third column selector and retain switching in the chat header. It is a scoped refinement, not a new visual direction.

**Findings**

No actionable P0, P1, or P2 differences remain in the reviewed captures or final source diff. The redundant entry selector is gone, the chat header retains desktop switching, and the original host composition and coaching card are preserved.

| State | Source capture | Revised implementation | Dimensions and normalization |
|---|---|---|---|
| Initial entry, conversation closed | [Before](../docs/design/review-2026-09-10/01-entry-before.jpg) | [After](../docs/design/review-2026-09-10/01-entry-after.jpg) | Both 1280 × 720 raster pixels; reported CSS viewport 1280 × 720; 1:1 effective density, no rescaling |
| Floating, first assessment complete, evidence collapsed | [Before](../docs/design/review-2026-09-10/02-floating-before.jpg) | [After](../docs/design/review-2026-09-10/02-floating-after.jpg) | Both 1280 × 720 raster pixels; reported CSS viewport 1280 × 720; 1:1 effective density, no rescaling |
| Integrated column, same completed assessment | [Before](../docs/design/review-2026-09-10/03-column-before.jpg) | [After](../docs/design/review-2026-09-10/03-column-after.jpg) | Both 1280 × 720 raster pixels; reported CSS viewport 1280 × 720; 1:1 effective density, no rescaling |
| Mobile, same completed assessment | [Before](../docs/design/review-2026-09-10/04-mobile-before.jpg) | [After](../docs/design/review-2026-09-10/04-mobile-after.jpg) | Both 390 × 844 raster pixels; reported CSS viewport 390 × 844; 1:1 effective density, no rescaling |

Each before/after pair was opened together in the same comparison input. Full-view comparisons confirm unchanged shell proportions, bottom attachment, column reflow, and mobile fullscreen structure. The slightly taller caption footer reduces the transcript height by approximately 3 px; corresponding scroll cropping at the transcript's upper edge is expected, not missing content. The column's third host statistic remains below the viewport fold, as in the baseline.

Focused inspection of the header icons, card labels/scores, evidence disclosure, composer, and footer was performed within each original-resolution paired input. Those regions are legible at these sizes; additional cropped assets were unnecessary.

### Five fidelity surfaces

| Surface | Review result |
|---|---|
| Fonts and typography | Host and conversation family, weights, hierarchy, line heights, and wrapping match the baseline. The demo notice intentionally increases from 10 px to 12 px, remains one line at 390 px, and reads clearly without a tooltip. No clipping or new truncation is visible. Font fallback and platform antialiasing were not independently exercised. |
| Spacing and layout rhythm | Initial selector removal leaves the prescribed entry at its original bottom position. Floating and column geometry, card padding, borders, rounded corners, and message rhythm remain consistent. Removing the duplicate Focus conversation button clears the host area it previously obscured. |
| Colors and tokens | Existing neutral surfaces, primary accent, user bubble, borders, focus styling, and disabled-send appearance are preserved. No new semantic score colors or palette drift appear. This is visual comparison, not a new numerical contrast audit. |
| Image quality and assets | The supplied Aria logo remains sharp and proportionate. Header controls keep the existing icon-library style. The mobile layout icon is intentionally replaced by Minimize; no source image or logo was approximated with code art. |
| Copy and content | The fixed question, assessment, three skill labels/scores, Q3 period, next step, and evidence action are preserved. The clearer caption explicitly says follow-ups are demo replies. Desktop layout control remains available; source inspection confirms the intermediate-width label is now Expand conversation. |

### Fix and re-comparison history

1. **Requested entry simplification, resolved:** the before entry capture shows two layout choices above the prompt. The after capture removes them while preserving the initial question and submit control.
2. **[P2, resolved] Duplicate control behind the floating surface:** the floating before capture shows a partially obscured Focus conversation button. The after capture removes that duplicate; source now hides the entry whenever the conversation is open or minimized and restores Resume when closed.
3. **[P2, resolved] Mobile layout switch without a layout change:** the mobile before capture shows a layout icon despite both modes using fullscreen. The after capture shows Minimize and Close. The source retains the selected desktop mode internally and removes switching only at widths where both layouts converge.
4. **[P2, resolved in source; live breakpoint verification owned by root] Misleading intermediate-width label:** at 761–1099 px the layout action expands fullscreen, so its label and icon now say Expand conversation. At 1100 px and above it remains Use integrated third column. The matched screenshots above do not exercise this intermediate-width behavior.
5. **[P3, resolved] Small and indirect demo explanation:** the enlarged, explicit footer copy is visible in all three after conversation captures, with no overlap or clipping. This supersedes the earlier report's caption-polish suggestion.

### Verification boundaries

The reviewer inspected the final scoped diff in `App.tsx`, `AssistantExperience.tsx`, and `assistant.css`; the conversation provider and mock contract are unchanged. Root reports all **8 tests passing** and a successful production build after these edits.

Root separately reported the following live checks; these are not independently claimed from the paired screenshots:

- Default invocation opens floating with no selector. At 1280 px, switching to the integrated column and back preserves four messages and an unsent draft. Evidence displays the exact three supplied snippets, and Enter sends a scoped follow-up.
- At 936 px, floating measures 460 × 760 px; Expand conversation becomes a full-width 936 px dialog. Shrinking to 320 px removes the switch, moves focus to the heading, and makes Minimize the next Tab target. The draft textarea measures 64 px for both client and scroll height, without clipping, and the notice is 12 px.
- Mobile minimize/restore retains the draft, and Escape returns focus to Resume. The viewport override was reset afterward.
- Console error/warning entries after the fresh reload at `2026-09-10T07:47:45.066Z` were empty. An earlier HMR dependency-array warning at `07:46:21` remains in historical logs and is not represented as a fresh-load failure.

Earlier limitations for physical mobile keyboards, screen-reader announcements, enlarged text, OS reduced-motion switching, and formal accessibility conformance still apply.

**Open Questions**

- None blocking this scoped refinement.

**Implementation Checklist**

- [x] Compare fresh entry, floating, column, and mobile before/after pairs together.
- [x] Evaluate typography, spacing, tokens, assets, and app copy.
- [x] Recheck the removed selector, obscured duplicate control, mobile controls, and readable demo notice.
- [x] Inspect responsive label and focus-recovery changes in the final source diff.
- [x] Preserve the first-answer contract and both desktop layouts.

**final result: passed**
