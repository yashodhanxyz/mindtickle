# Coaching surface and motion refinement

The coaching card uses the existing neutral secondary surface so the structured result separates from the assistant prose without adding a new accent colour. The evidence action remains white and the supplied scores stay textual because the mock does not define a scale or benchmark.

Motion follows the placement:

- Floating chat rises a short distance from its bottom attachment and reverses on close or minimise.
- The integrated column moves in from the workspace edge while the third grid track expands; both reverse together on close.
- Mobile uses a short fade and vertical offset so the full-screen dialog feels responsive without a large theatrical slide.
- The user message, first prose state, coaching-card arrival, evidence disclosure, and Latest reply affordance use the existing short duration tokens. Stream chunks do not animate individually.
- Reduced motion removes transforms, grid interpolation, disclosure motion, and decorative animation while retaining meaningful status text and final states.

## Verified states

- [Integrated column with expanded evidence](column-card-expanded.jpg)
- [Floating chat with collapsed evidence](floating-card.jpg)
- [Mobile chat at 390 × 844](mobile-card.jpg)

Browser checks covered column open/close, floating open/minimise, disclosure, mobile open/close, inert closed surfaces, and focus return. All 25 tests and the production build passed. OS-level reduced-motion playback, physical-phone keyboards, and screen-reader timing remain device-specific verification work.
