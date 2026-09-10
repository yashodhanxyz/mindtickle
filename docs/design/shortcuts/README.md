# Command menu and sidebar refinement

The visible “AI conversations” sidebar heading is removed. The history dialog is named “Conversations”. New conversations remain unpinned (`pinned: false`); pinning is only an explicit row-menu action. The Lena pin left by the earlier preview test has been cleared. Existing intentional user pins are not silently migrated or removed.

Search is now a real button opening a command menu. **Command K** or **Control K** toggles it. Type to filter actions or saved conversation titles, use Up/Down to select, and Enter to run. Commands create a conversation, open the current one, show history, adjust the desktop sidebar, or display the shortcut guide. The guide lists the actual application keys, including Escape, Tab, Enter, and Shift Enter; it does not claim extra global shortcuts for every action.

On phones Search is available in the top bar. When chat covers that bar, minimise or close it to reach Search or conversation history. Command/Control K also remains available while chatting. The desktop sidebar command is omitted on mobile. A rename/delete dialog is not interrupted by the global shortcut. No destructive action runs directly from the command menu.

The menu uses the existing neutral surfaces, primary selection color, Inter font, rounded corners, and Lucide icons. A native modal dialog contains an editable combobox and listbox; input focus stays in the search field while `aria-activedescendant` identifies the selected result. This follows the [WAI-ARIA combobox keyboard guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/). Escape closes only the menu and restores focus; Tab/Shift Tab stay inside. No animation or dependency was added.

## Checks

- Desktop floating and column: click and Command/Control K entry, arrow selection/Enter execution, New, current conversation, saved-title search, compact/expand sidebar, shortcut guide, empty results, scoped Escape, and focus return.
- Both routes at 320 × 568 and 390 × 844: touch Search, search/select Marcus, reopen by shortcut, Escape to composer, no horizontal overflow. [Measured results](mobile-results.json).
- Column at 320: history-to-commands transition, help view, reverse Tab containment and restoration to the chat control.
- Sidebar before/after were opened together at the same 1379 × 1204 viewport and closed-chat state. Intentional differences are heading removal, no demo pinned group, and a functional Search control. The remaining shell/card/logo/type styling is unchanged.
- Desktop menu and narrow mobile menu/guide inspected for spacing, wrapping, focus and bounds. Shortened the placeholder to avoid visual cropping at 320 px.
- 17 existing tests and TypeScript/production build pass. Original assignment README and mock remain unchanged.

Evidence: [before](before.jpg), [after](after.jpg), [desktop menu](menu-desktop.jpg), [shortcut guide](shortcut-guide.jpg), [narrow mobile menu](floating-320-menu.jpg), [narrow guide](column-320-guide.jpg).

Limits: physical mobile keyboards, screen-reader speech and real Windows hardware were not exercised. Both modifier handlers were tested in the browser. This is not a full accessibility certification. Conversation history is still local to each option with the prior storage/sync limits.
