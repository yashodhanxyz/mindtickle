# Sidebar hover refinement

The sidebar now uses one neutral hover surface for navigation context, search, New chat, and unselected conversations. Selected conversations retain the accent surface on hover instead of flashing back to neutral.

Pointer-specific hover rules only run when the device reports a fine pointer with hover support, avoiding sticky hover states on touch devices. Conversation overflow actions stay visually quiet at rest, appear when the row is hovered or contains keyboard focus, and remain visible by default on touch devices. Focus-visible outlines and the existing row semantics remain intact.

## Verified states

- [Menu item hover](menu-hover.jpg)
- [Selected chat hover](chat-hover.jpg)

Browser checks confirmed the selected chat keeps its accent background, the overflow action appears on row hover, and keyboard Tab focus also reveals that action. Static shell navigation retains its default cursor because those entries are contextual in this assignment rather than implemented destinations.
