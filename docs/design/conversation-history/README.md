# Multiple conversations in both options

10 September 2026. The user-approved extension keeps `/floating` and `/column` separate and adds a shared conversation interaction model. The original assignment README and fixed mock are unchanged.

## Try it

1. Open either option and ask the supplied Marcus question to see the original streamed assessment.
2. Choose **New conversation** in the sidebar or the plus button in chat. Ask about Lena, Didi, Brookfield, or Percepto without receiving an unrelated Marcus assessment.
3. Revisit a conversation from **AI conversations**. Use its options menu to rename, pin/unpin, or delete. Delete requires an explicit confirmation with the conversation name.
4. Enter a draft, switch conversations, and return. Messages, draft, evidence disclosure, and reading position belong to each thread. Closing, minimising, and refreshing retain saved work. A draft-only conversation also resumes without automatically submitting Marcus's question.
5. On mobile or with a compact sidebar, use **Conversations** to open history. Escape closes the innermost menu/dialog first. One conversation is visible at a time.

Empty conversations are reused to avoid accumulating blank entries. Nonempty unsent drafts appear with a Draft label. Pinned conversations are grouped above Recent; viewing an older thread does not change its recency. Titles derive from the first question and remain stable after manual rename. Storage failure is visible; the session can continue in memory.

## Implementation choices

A library owns controllers keyed by conversation ID; selection only changes which controller is displayed. Background responses therefore finish in their original thread. Deletion disposes that controller so delayed stream events cannot recreate it. Versioned local storage keeps each option separate. Incomplete responses restored after a reload are labelled interrupted and allow another question.

The sidebar extends existing spacing, colors, typography, radii, and icon family. Native dialogs and popovers provide top-layer placement, with explicit keyboard navigation, focus containment and restoration. No dependency or drop-in assistant kit was added.

The history extension exceeds the README's required single assistant moment and is presented as the chosen enhancement. The required entry, dismissal, fixed stream/card, evidence disclosure, responsive layouts, status announcements, keyboard behavior, and reduced-motion alternative remain the primary demonstration.

## Verification

| Check | Result |
|---|---|
| Floating and column at 1440 × 900 | Create, switch, rename, pin, drafts, original card passed |
| Both routes at 390 × 844 and 320 × 568 | New Didi thread, rename/pin, select, draft, minimise/restore, reload/resume, delete active, empty state, composer focus and viewport bounds passed |
| Stream isolation | Start Marcus, switch and ask Lena; completed assessment stays with Marcus |
| Storage | Restore title/pin/draft/evidence/reading state; separate option stores; interrupted/malformed/unavailable storage covered |
| Deletion | Cancel preserves thread; confirm removes it; late events cannot resurrect deleted thread |
| Keyboard | Menu arrows/Escape, nested rename cancel, history Escape, mobile Tab/Shift+Tab containment, focus restoration passed |
| Compact sidebar | Overlay visibility and selecting a saved chat passed after scoping the hiding selector |
| Reading position | Switch away and back retained measured scrollTop 207 and evidence state |
| Draft-only reload | Resume retained unsent text, empty state, and no assessment card |
| Automated checks | 17 tests; TypeScript and production build passed |

[Mobile lifecycle results](mobile-results.json) record the four actual viewport runs. These captures show representative test threads, which were subsequently deleted through the UI. Browser console history includes an earlier HMR hook-state error during migration; no new warning/error was reported after the final reload and interaction pass. No console history was erased.

Fixed during review: menu focus timing causing Escape to close chat, nested rename cancellation closing history, history reverse Tab leaving its dialog, automatic bottom-follow clipping the empty-state heading, compact-sidebar CSS hiding overlay content, and resuming an unsent draft invoking the original preset. Each affected flow was rechecked after its fix.

## Visual evidence

- [Floating desktop](floating-desktop.jpg) / [column desktop](column-desktop.jpg)
- [Floating mobile history](floating-390-history.jpg) / [column mobile history](column-390-history.jpg)
- [Floating narrow history](floating-320-history.jpg) / [column narrow history](column-320-history.jpg)
- [Floating narrow new chat](floating-320-new.jpg) / [column narrow new chat](column-320-new.jpg)

The previous separate-page desktop answer captures and current captures were opened together per option at the same 1440 × 900 CSS viewport and completed Marcus assessment, collapsed evidence, and focused composer. Captures are density 1 with no resizing. Full-view and focused inspection checked fonts, spacing, neutral tokens, logo/icons, copy and score alignment. Intentional differences are the history section, header controls and saved title. Transcript cropping at the floating panel's top is unchanged scrolling behavior. The mobile new-chat heading is visible at 320 pixels; the transcript scrolls when all starter choices do not fit.

## Boundaries

History is saved on this browser/device, with no account or cloud sync. Simultaneously editing the same option in multiple tabs is not synchronized and may overwrite stored history; use one active tab per option. Clearing browser storage removes it. Follow-ups remain authored demo responses grounded in the fictional workspace, not a connected general-purpose model. The exact Marcus assessment is the only scored fixture.

Browser viewport and keyboard tests do not cover physical touch/IME/software keyboards, VoiceOver/NVDA speech, forced colors, OS reduced-motion switching, or a full numerical contrast audit. No full accessibility certification is claimed. A public deployment and recording remain submission-preparation steps.
