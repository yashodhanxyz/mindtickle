# Review fixes and mobile QA — 11 September 2026

The approved review findings and mobile integration issues are addressed in both separate options. The assignment README and fixed mock payload are unchanged.

## Changes

- Narrow screens stack the overview cards instead of showing a clipped horizontal strip. Chat dimensions follow CSS breakpoints immediately, with visual-viewport bounds for available height. Mobile header targets are 44 px; history, rename/delete, and command dialogs have bounded, scrollable content.
- The stream resize observer reads current messages. A fresh assessment follows the answer to the end rather than being reset to the top by its initial empty state.
- Keyboard navigation automatically minimizes desktop floating chat when it would cover the newly focused workspace control. Focus stays on that control. Escape from inside chat still returns to the entry point; Escape from the workspace preserves its current focus.
- Contextual wording rewrites work in a fresh Brookfield conversation without first requiring a Marcus assessment.
- Persistence uses uniquely keyed, immutable change batches. Separate fields merge across same-origin tabs; message IDs are UUIDs; deletion tombstones prevent late updates from restoring deleted conversations. Older history remains readable. Draft and reading updates coalesce over 200 ms, with lifecycle flushes; response boundaries and metadata actions save immediately.

## Verification

| Check | Result |
| --- | --- |
| Unit regressions | 25 tests passed: mock, conversation, entities, library; includes concurrent drafts/reading, delayed saves, independent threads, metadata merging, deletion, batching, interruption recovery, and legacy migration |
| Production build | TypeScript and Vite passed |
| Floating desktop fresh stream | Completed assessment at scrollTop 121.5 / maximum 122; follows latest within rounding |
| Floating keyboard overlap | Tab reached Percepto in the overview; chat minimized and Percepto retained focus at y=504, unobscured |
| Two live tabs | Draft entered in one appeared in the other; evidence change merged back without losing draft; deleting the isolated QA thread removed it from both tabs |
| Column desktop | At 1379 px: 240 px sidebar, 679 px workspace, 460 px chat; no horizontal overflow |
| Column mobile | At 320 × 568: chat exactly fills viewport, composer remains visible, no horizontal overflow; Tab from empty composer wraps to Close; background main has inert attribute |
| Floating mobile | At 390 × 844: fullscreen chat fits; Minimize/Restore works; shared overview cards stack without horizontal overflow |
| Mobile commands/history | Opened history and command menu at 320 px; at 320 × 350 the command dialog fits y=12–338 with scrollable results |
| Source constraints | Original assignment README and mock unchanged; separate routes retained; column still has Close only, floating retains Minimize and Close |

Before/after images were inspected together at 390 × 844 in matched overview and floating-chat states. The overview changes from a clipped next card to a vertical stack. The chat retains its type, colors, evidence card and composer, with larger header targets. Additional column captures record 320 px and desktop geometry. A transient screenshot taken before viewport resize settled was discarded, rather than treated as an application defect.

Images: [overview before](mobile-before.jpg), [overview after](mobile-after.jpg), [chat before](mobile-chat-before.jpg), [chat after](mobile-chat-after.jpg), [column narrow](column-320-after.jpg), [column desktop](column-desktop-after.jpg).

## Limits

This is browser-local demo persistence, not account/cloud synchronization. The append-only journal is appropriate for assignment-scale history but has no compaction; a production version should use a bounded transactional store. History deletion removes conversations from the application, not forensic erasure of historical local-storage records. Clearing site storage removes those records. Storage failures leave the current session usable and show the existing failure notice.

Responsive preview does not certify physical-device software keyboards, screen-reader announcements, or full WCAG conformance. No physical phone was available for this pass. Fresh preview reloads were used after changing hook structure; earlier development HMR errors are historical, not fresh-load findings. Temporary viewport overrides were reset and the isolated QA conversation was deleted.
