# Three refined directions for the Aria coaching answer

Date: 10 September 2026. **Design proposals, reviewed against the supplied contract; not implemented or approved.**

This document develops all three directions to the same standard. The task is to help Jordan understand Marcus's discovery-call performance and identify what to coach next. It is one post-invocation answer inside the existing Aria Sales Hub, not a new assistant product.

## Authority and evidence

- [Assignment README](../../design-engineer-take-home-v3/README.md): scope, required behaviour, evaluation, and submission guidance.
- [Fixed stream and content](../../design-engineer-take-home-v3/mock/streamAnswer.ts) and [types](../../design-engineer-take-home-v3/mock/types.ts): authoritative answer data and event sequence.
- [Host integration](../../design-engineer-take-home-v3/src/App.tsx), [placeholder](../../design-engineer-take-home-v3/src/AssistantExperience.tsx), and [styles](../../design-engineer-take-home-v3/src/styles.css): preserve the entry point, focus return, and visual language.
- [Mobbin study](../research/mobbin-reference-review-2026-09-10.md): directional references, not proof of usability, accessibility, or motion quality.
- [Current Aria screenshot](assets/aria-host-reference.jpg): captured from the existing local app, before assistant implementation.

**Review correction:** the earlier research recommendation was too restrictive about side panels. A simultaneous host task is necessary to justify a multitasking claim, but not every side-panel design. A modal drawer can provide a predictable tall reading area while keeping the host visible for orientation. All three proposals below are modal; none promises simultaneous host interaction.

## Common content contract

Every option uses the full supplied narrative and coaching card. The differences concern containment, hierarchy, evidence inspection, and movement—not different data or extra features.

Submitted question:

> How is Marcus doing on discovery calls this quarter?

Streamed narrative, appended in the supplied order and with the original spacing:

> Marcus is improving at discovery, especially when he slows down and follows the buyer's language. His strongest recent moment was turning a vague security concern into a concrete success measure. The next coaching opportunity is to involve more stakeholders before proposing a solution.

The card contains **Marcus Bell**, **Last 6 discovery calls · Q3**, and **Clear progress, with one repeatable gap in stakeholder discovery.**

| Skill | Score | Supporting evidence |
|---|---:|---|
| Question depth | 4.1 | “What would need to be true for your team to trust an autonomous patrol?” |
| Active listening | 3.8 | Marcus reflected Omar's compliance concern before moving to product detail. |
| Stakeholder discovery | 2.9 | Three calls ended without confirming who else shapes the decision. |

**Next step:** In the next Brookfield call, ask who must validate operational and legal readiness.

Preserve the card summary as well as the streamed narrative, but give them different typographic weight rather than inventing a third summary. Only the Question depth evidence is a quoted utterance. The other two are summaries. The card scope says the last six calls, not all calls in the quarter.

Use neutral scores without a denominator, progress bars, thresholds, traffic-light colours, rankings, historical trends, or invented benchmarks. The mock has no recording IDs, source URLs, timestamps, transcripts, playback, or alternative answers. The next step is advice, not a task-creation action. No second composer or suggested follow-up questions.

## Shared behaviour and implementation decisions

These are proposed design decisions that satisfy the README; they are not additional assignment requirements.

### Stream storyboard

The default mock completes in approximately 2.26 seconds, excluding rendering and scheduling overhead. Do not extend it to make an animation visible.

| State | Event / approximate time | What Jordan sees | Focus, status, and movement |
|---|---|---|---|
| Open | Invocation, before first event | The chosen surface, assistant title, submitted question, visible close control. No fabricated answer or progress stage. | Focus the static heading once. Establish the final outer footprint. Keep a small status slot so later label changes do not shift the prose. |
| Reviewing | `status`, ~360 ms | Exactly “Reviewing 6 discovery calls”. | A separate polite status region announces it once. Use a static progress label with a restrained activity indicator in normal motion. |
| Streaming | Three deltas, ~820 / 1,280 / 1,740 ms | One paragraph grows downward in the fixed reading area. | Append the actual deltas. No character-by-character replay, per-chunk announcements, auto-focus, or repeated surface resizing. A short opacity reveal can soften arrival without delaying content. |
| Card available | Complete `artifact`, ~2,260 ms | Complete card with rep, period, summary, all scores, and next step. Evidence initially collapsed. | Insert as one coherent block below the narrative. No staged score counting. No focus jump to the card. |
| Ready | `done`, immediately after artifact | Card persists; visible progress settles to a small static “Answer ready” label. | Announce “Answer ready. Coaching card available.” once. This must not depend on an animation finishing. |
| Inspect | User activates evidence control | The associated supplied evidence appears below the relevant skills. | Keep focus on the activating control and expose its expanded state. The next step stays in the document and never requires expansion to access. |
| Dismiss / reopen | Close or Escape at any point | Return to the unchanged host; a new invocation starts a fresh answer. | Stop applying the old run's events. Call the host's existing dismissal pathway, which restores focus to the original input. |

At `speed: 0`, intermediate states may never paint. The complete answer must still render correctly. Do not force a minimum spinner duration. A generator may still finish its already scheduled wait after dismissal; the acceptance requirement is that its events cannot affect a closed or newer experience.

### Reading stability

- The outer surface's width, height, and reading origin are established on opening and remain stable during stream events. Recalculate bounds and anchoring when the viewport changes through resizing, rotation, zoom, virtual keyboard, or mobile browser chrome; preserve focus and the reader's position where practical. Content arrival alone must not repeatedly recenter the dialog or move an anchored window upward.
- One body scroll area contains the narrative, card, evidence, and next step. A compact fixed header keeps the assistant title and close control reachable. The question may sit below that header on roomy layouts, but joins the scrolling body on narrow, short, or enlarged-text layouts so it cannot consume the reading viewport. There is no separately scrolling scorecard.
- Do not automatically scroll to new content. Keep the user's reading position. New content is discoverable through natural downward flow and the completion status; the supplied answer is short enough not to require another “jump to answer” control.
- User-requested evidence expansion may increase document height. That is deliberate disclosure, not an unprompted layout jump. Keep the control near the changed content and avoid a long height animation.
- “Next step visible” means present in the initial card without requiring disclosure; it does not promise that every viewport shows the entire card simultaneously. At narrow widths or enlarged text, scrolling is expected.

### Keyboard, focus, and assistive technology

- Use a modal dialog model consistently across desktop and mobile. Background controls, including the launcher, are inert while open. A visible background provides orientation, not interaction.
- Initial focus goes to a static heading with programmatic focus support, not the covered launcher or a nonexistent chat composer. Give the dialog a short accessible name; do not use the entire streamed answer as its description.
- Keep focus contained in the modal. The close button, a labelled focusable answer scroll region, and evidence controls follow a logical order. While the scroll region itself is focused, native Arrow/Page Down/Space scrolling must reach the narrative, evidence, and next step; Space on an evidence button activates that button instead. Verify this in the actual browser. Every action and the focused scroll region have a visible focus indicator.
- Close and Escape work before the first status, during streaming, after completion, and with evidence expanded. Escape closes the assistant directly; there is no unnecessary evidence-layer dismissal step.
- Retain the host's existing focus return through `onDismiss`. Ensure any dialog primitive does not compete with it or restore focus into a removed surface.
- A dedicated, initially mounted polite atomic status region announces meaningful changes. The changing narrative and entire card are ordinary readable content, not live regions. Instant completion may coalesce progress into the final announcement.
- Evidence buttons have explicit show/hide labels, `aria-expanded`, and `aria-controls` relationships. Collapsed evidence is also hidden from assistive technology. Skill and score remain readable in either state.
- Give the close control and disclosure actions comfortable touch areas, aiming for at least 44 CSS px. Do not rely on hover, colour, swipe gestures, or an icon without a name.

### Motion and reduced motion

Reuse the host's Inter font, semantic colours, radius scale, easing, and 140 / 220 ms motion tokens. Motion is a proposed starting point, to tune in the actual app.

| Moment | Normal motion | Reduced motion |
|---|---|---|
| Opening | One restrained 220 ms entrance appropriate to the surface's location. | Immediate placement at final geometry; no translation, scale, or morph. |
| Progress | Supplied status with a quiet activity indicator. | Static supplied status label; no pulsing or rotation. |
| Text arrival | Optional 140 ms opacity reveal of newly appended content; no replay of earlier text. | Immediate append, same order. |
| Card arrival | One 140 ms opacity reveal, optionally 4 px vertical settling; no animated numbers. | Immediate full card. |
| Evidence | Immediate local reflow, with a short opacity reveal if useful. | Immediate show/hide; correct expanded state and clear labels. |
| Dismissal | Immediate dismissal so focus return is reliable. | Same. |

Content must never remain transparent, clipped, or non-interactive when animations are disabled. Static labels and typography communicate state even when movement is absent.

## Option 1 — Anchored answer

**Product promise:** the answer belongs to the question Jordan just submitted. A spacious reading window stays visually associated with the existing bottom-centre launcher.

### Refined desktop composition

- Explore 620–680 px width, aligned to the launcher's centre within the host main area and clamped to the viewport. These are starting dimensions, not acceptance criteria.
- Keep its lower edge about 12 px above the launcher. Compute the available height from the actual launcher position, a top margin, and the viewport. Keep that height stable as content arrives; recalculate on viewport changes using the shared reading-stability rule.
- Use a white 16 px-radius surface, one restrained shadow, and a quiet neutral scrim. The launcher remains recognisable beneath it but inactive.
- Compact fixed header: assistant title and close control. Question sits below the title on roomy layouts and moves into the scrolling body when height or text wrapping requires it. Body: reserved status line, streamed narrative, one clearly grouped coaching card, then next step.
- A single **Show supporting evidence** button above the skill list reveals all three snippets beneath their corresponding rows. It changes to **Hide supporting evidence**. Scores remain right aligned; the next step remains below the list in the same scrolling body.

### Desktop and mobile storyboard

| State | Desktop | Narrow mobile |
|---|---|---|
| Reviewing | Full stable reading window appears above the launcher; status sits below the question. | Full-height modal sheet with the question and close control at the top. Preserve the visual language, not a literal tiny launcher anchor. |
| Streaming | Paragraph grows down from a stationary origin. Empty remaining space is intentional for this brief stream. | Paragraph wraps naturally in a padded single column; the sheet does not grow with each chunk. |
| Complete | Card appears below narrative; all scores and next step available without evidence expansion. | Same content order; natural scrolling to the full card. |
| Evidence expanded | All three snippets appear locally; outer geometry does not change. | Same global disclosure; one body scroller, no nested source sheet. |
| Dismiss | Immediate close and focus return to original launcher input. | Same; account for the mobile keyboard that may reappear when the input regains focus. |

**Motion signature:** a small upward entrance from the launcher's vicinity, approximately 8–12 px, followed by a settled reading surface. Avoid a prolonged pill-to-document morph.

**Improvement made during review:** replaced a small growing popover with a real reading window. This resolves the predictable upward jumps as content arrives.

**Remaining tradeoff:** it sacrifices vertical space above the launcher, especially on short laptops. For short desktop viewports, use a nearly full-height modal sheet from the outset rather than introducing a separate enlargement button. The exact height breakpoint must be chosen after rendering the real content; ~680 px is an initial investigation point.

**Decision gate:** at 1280×720 and a shorter viewport, Jordan must reach the complete answer, expanded evidence, next step, and close control without tiny type or nested scrolling. If the anchored geometry contributes more constraint than useful locality, prefer the centred or side surface.

**Reference:** [Fireflies global assistant flow](https://mobbin.com/flows/65275e70-7b71-4bc8-9d23-83586b90dc82) supports a recognisable bottom entry, but its answer uses a large centred overlay. Our completed anchored arrangement remains a design hypothesis, not a copied or validated Mobbin pattern.

## Option 2 — Assistant drawer

**Product promise:** a predictable, tall place to read an assistant assessment. The visible host keeps Jordan oriented; the drawer is modal and does not claim multitasking.

### Refined desktop composition

- Explore 520–600 px width at the right viewport edge, using the full available height. Overlay rather than push/rebuild the supplied shell.
- Use a stable header and one body scroll area, with a subtle left divider and restrained elevation. Keep the answer a single column, not three narrow score tiles.
- Order: assistant title/question, status, streamed narrative, Marcus/period/card summary, skills, next step. The drawer should read as an assessment, not an empty chat product.
- Use **per-skill evidence disclosure**. Each skill retains its label and score, with an explicit Show evidence control. Opening one does not close another, so Jordan can compare explanations.
- The accessible label names the skill, for example **Show evidence for Stakeholder discovery**. Expanded controls become Hide evidence. Three controls implement one coherent disclosure pattern; the README does not require exactly one button.

### Desktop and mobile storyboard

| State | Desktop | Narrow mobile |
|---|---|---|
| Reviewing | Tall right drawer opens at final width; close remains at top right. | Full-width, full-height modal reading surface; remove the unusable sliver of host. |
| Streaming | Prose grows downward in the stationary column; width allows readable line lengths. | Same order, 16 px body text and comfortable horizontal padding. |
| Complete | Card and next step follow the narrative. Evidence controls are visible beside/below each skill. | Skill, neutral score, and disclosure wrap deliberately; controls never collide with long labels. |
| Evidence expanded | Jordan may open one, two, or all three rows; each snippet stays with its skill. | Same independent disclosure; opening a row does not collapse a previously inspected row. |
| Dismiss | Close or Escape returns focus through the existing host callback. | Same, without relying on swipe-to-dismiss. |

**Motion signature:** a short right-to-left entrance, about 16–24 px over 220 ms. Do not slide the entire viewport width or animate the host layout.

**Improvement made during review:** reframed its purpose around a stable reading location rather than unsupported concurrent host work. Per-skill disclosure reduces how much extra text a narrow column needs to show at once.

**Remaining tradeoffs:** more line wrapping, more evidence actions when inspecting all three skills, and less immediate relationship to the bottom-centre launcher. Do not add a composer, history, filters, or follow-up prompts to make it feel like a conventional chat drawer.

**Decision gate:** at 520 px drawer width, the real content, longest skill label, keyboard focus rings, and all evidence must remain readable. If repeated disclosure feels unnecessarily laborious, use the shared global evidence control without changing the drawer itself.

**References:** [Fireflies live notes](https://mobbin.com/flows/31866c11-6fcc-4585-977b-7ec6b0d0531e) and [Semrush assistant](https://mobbin.com/screens/d5fa9c73-0fbd-4b6e-9d7a-b7fa36e54a2c) demonstrate adjacent answer columns. Our modal behaviour is a deliberate proposal, not a behaviour established by those screenshots.

## Option 3 — Focused coaching brief

**Product promise:** one clear path from the overall assessment to supporting evidence and the next coaching action.

### Refined desktop composition

- Explore 680–760 px width, centred in the viewport, with a viewport-capped height and fixed opening footprint. Do not recenter a content-sized dialog after every chunk.
- Use the existing white surface, neutral divider, 16 px radius, restrained shadow, and quiet scrim. This is part of Aria, not a separate report application.
- Compact fixed header: assistant title and close. The question can sit below it on roomy layouts, but moves into the scrolling body on narrow, short, or enlarged-text layouts. Body: status, full streamed assessment, then a single coaching section.
- The card's Marcus heading and exact period anchor the scope. The supplied summary is secondary to the narrative. Skills form three aligned rows with neutral numbers, not a dashboard of tiles.
- One **Show supporting evidence** control reveals all three explanations below the associated skills. The next step is visually distinct through spacing and a restrained accent tint; it remains in the initial card.

### Desktop and mobile storyboard

| State | Desktop | Narrow mobile |
|---|---|---|
| Reviewing | Stable central reading surface opens; question and status establish purpose immediately. | Full-height sheet with a visible close and one reading column. |
| Streaming | Narrative appears in the same place throughout; no surface recentering. | Same sequence; text wraps without horizontal overflow. |
| Complete | Full card arrives beneath the assessment; hierarchy separates conclusion, scores, and next step. | The card stays in the same scroller as the narrative; no fixed bottom CTA covers content. |
| Evidence expanded | One control reveals all three associated snippets; no tab switch replaces the summary. | Same global disclosure; plain quote versus summary formatting remains accurate. |
| Dismiss | Immediate close and focus return to original input. | Same, including dismissal while the virtual keyboard or browser chrome changes the viewport. |

**Motion signature:** a restrained 8 px upward settle with opacity over 220 ms, followed by the card's brief arrival. No dramatic zoom or completed-research celebration.

**Improvement made during review:** removed redundant hero summaries, source drawers, and tabbed evidence. Kept the full supplied narrative/card while simplifying their presentation.

**Remaining tradeoffs:** greater sense of interruption and empty space during the roughly two-second stream. Do not fill that space with fake process steps or pre-rendered final content. A modest fixed surface is preferable to ornamental loading choreography.

**Decision gate:** the complete collapsed card should scan clearly at a typical laptop size; expanded evidence may scroll. The dialog must preserve the reading origin at all stream stages and remain coherent on short screens.

**Reference:** [Fireflies completed AskFred answer](https://mobbin.com/screens/0e277c22-7dac-4085-aa59-cd24cd3dbc52) is the closest placement analogue. It supports the rationale, not a claim of superior task completion.

## Cross-check against every assignment requirement

**Status key:** Defined = addressed in the design specification, not tested in working code. Pending = implementation or delivery work remains. There are no implementation passes claimed here.

| README requirement | Anchored answer | Assistant drawer | Focused brief | Evidence still needed |
|---|---|---|---|---|
| Start at supplied entry; dismiss; Escape; focus return | Defined: anchored modal and existing callback | Defined: right modal and existing callback | Defined: central modal and existing callback | Keyboard walkthrough at every stream state. |
| Actual status, three chunks, complete card, done | Shared exact event contract | Shared exact event contract | Shared exact event contract | Stream integration and supplied sequence test. |
| Coherent reveal without distracting jumps | Fixed footprint; height adaptation | Fixed tall column | Fixed footprint; no recentering | Normal-speed recording, scrolling during arrival. |
| One meaningful card interaction | Global evidence disclosure | Independent per-skill disclosure pattern | Global evidence disclosure | Pointer and keyboard expansion/collapse, correct associations. |
| Desktop and narrow mobile | Anchored desktop; full-height mobile/short-screen sheet | Edge drawer; full-width mobile surface | Central desktop; full-height mobile surface | Real browser widths/heights and enlarged text. |
| Keyboard, visible intentional focus | Shared modal focus plan | Shared modal focus plan | Shared modal focus plan | Tab/Shift+Tab, Space/Enter, Escape, close, focus return. |
| Meaningful assistive announcements, not every chunk | Shared status region | Shared status region | Shared status region | Actual screen-reader test; no duplicate or chunk announcements. |
| Purposeful motion and reduced alternative | Short upward entrance | Short lateral entrance | Short central settle | Reduced-motion setting; no invisible or clipped content. |
| Typed, readable, extensible code | Pending | Pending | Pending | Small reviewable implementation, typecheck/build, debrief change. |
| Preserve shell; focus on answer; no drop-in assistant kit | Defined | Defined | Defined | Review changed files and dependencies. |
| Readable source and natural commit history | Pending final implementation | Pending final implementation | Pending final implementation | Repository read-through and ordinary commits. |

### Derived acceptance checks

These checks are our way to verify the required behaviour, not new datasets or failure protocols:

1. Default timing: all supplied text appears once, in order, and the card survives the immediately following `done`.
2. `speed: 0`: complete output without mandatory loading dwell or dependence on animation-end.
3. Close before status, mid-text, after card, and with evidence expanded: no reopening, late UI updates, or stale announcements.
4. Rapid close/reopen and development effect replay: one current response, no doubled deltas or old card.
5. Reader scrolls away from the bottom during arrival: position is preserved.
6. Evidence show/hide: correct snippet, meaningful label/state, retained focus, no hidden next-step gate.
7. Desktop: 1440×1024 and 1280×720; short-height inspection around 1024×600.
8. Mobile: 390×844 and 320×568; enlarge text and test 200% zoom/reflow. These dimensions are our test choices.
9. Modal behaviour: no interactive/focusable background, intentional initial focus, visible focus, reachable header, reliable return.
10. Screen reader: reviewing/completion meaningful and restrained; answer can be read normally; expanded evidence is associated and available.
11. Reduced motion plus instant response: all information and controls remain accessible with no animation dependency.
12. If Copy next step is added, confirm success only after actual clipboard success; failure leaves selectable text available and never claims a copy succeeded.

## Engineering scope for the eventual selected direction

Build one selected experience. These are three design options, not a request to ship an option switcher or three production assistants.

- Keep invocation in `App.tsx`. Replace the provided placeholder with the chosen surface.
- Keep stream consumption, surface/focus behaviour, and card disclosure understandable as separate responsibilities. Reuse `StreamEvent` and `CoachingCard`; do not replace the contract with loose objects or inferred numeric thresholds.
- Isolate each invocation so late events cannot update a later run. Reset narrative, card, status, and evidence on a fresh invocation.
- Use CSS and a native/headless modal primitive as appropriate. No drop-in chat/assistant UI kit. A new app framework, new routes, or substantial shell redesign is unnecessary for this scope.
- Run existing sequence tests, typecheck, and build. Add targeted lifecycle/interaction coverage only where it verifies real failure cases; a static mock should not trigger a large test framework exercise.
- Manually verify the actual keyboard, screen-reader, mobile, normal-motion, and reduced-motion experience. Passing TypeScript cannot establish those behaviours.

## Optional enhancement and submission preparation

**Only optional enhancement proposed:** Copy next step. It copies the exact supplied sentence for Jordan to reuse in coaching preparation. It comes after the core journey is polished and is omitted from initial concept images to avoid treating it as required.

The README suggests a live preview, a concise `DECISIONS.md`, and a short desktop/mobile recording. Approximately 300 words and 2–5 minutes are guidance, not formatting tests. The 3–4-hour build target and ideal 3–4-day return are scope guidance; this planning work does not change the assignment's intended small size.

The final decision note should explain the user priority, one proud design/motion decision, where AI helped and where its output was overridden, and what to improve next. A useful recording shows invocation, real stream, evidence, keyboard dismissal/focus return, and narrow mobile; reduced-motion behaviour can be briefly demonstrated. Preserve natural commit history and be prepared to make a small code/design change in the debrief.

## Comparative review and recommendation

| Dimension | Anchored answer | Assistant drawer | Focused coaching brief |
|---|---|---|---|
| Distinct strength | Strong relationship to submitted question | Predictable tall reading location | Generous central hierarchy |
| Main compromise | Launcher consumes available height | Narrower wrapping and more disclosure actions | Stronger interruption for a short question |
| Evidence default | All snippets together on request | Selected skills, independently expandable | All snippets together on request |
| Highest-risk QA area | Short height and anchor geometry | Long labels and expanded row wrapping | Stable centre during content arrival |
| Scope discipline | Avoid enlargement modes and complex morphs | Avoid chat features and host reflow | Avoid report tooling and duplicate summaries |

All three now cover the required experience at the design level. **The focused brief remains my recommendation**, because the task asks for one assessment with evidence and an action, and this arrangement offers room for that hierarchy with a conventional focus model. The drawer is a credible alternative on reading consistency; the anchored window is a credible alternative on locality. This is a reasoned design preference, not a research-proven ranking.

The next decision should select a direction using its visual proposal and these behaviour specifications. Only working implementation and the acceptance checks can establish that the assignment is complete.

## Independent review and changes applied

Two independent review passes checked the proposal against the README/mock and assessed product, interaction, and accessibility decisions. Both identified the need to distinguish stable streaming geometry from responsive viewport changes, and to avoid a long fixed question consuming a short screen. The design review also identified unresolved keyboard access to the reading region.

Applied improvements: bounds adapt to viewport changes; the title/close row stays compact while the question can scroll; and the answer region has explicit keyboard scrolling access with a visible focus state. Earlier reviews also corrected the side-panel rationale and prevented the anchored surface from growing upward with every chunk. These are specification reviews, not browser or assistive-technology test passes.
