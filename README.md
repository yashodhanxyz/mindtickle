# Mindtickle design engineer assignment

Private workspace for the Aria Sales Hub AI Assistant take-home assignment.

The [original assignment README](design-engineer-take-home-v3/README.md) is the source of truth for scope, required behaviour, and submission guidance. The starter app lives in `design-engineer-take-home-v3/`.

## Run locally

```bash
cd design-engineer-take-home-v3
npm ci
npm run dev
```

Open `/floating` for the bottom-attached chat or `/column` for the integrated third column on the dev server URL. Each page has a fixed presentation and its own in-session conversation history, with no in-product layout switch. Start and reopen chats from the sidebar; the mobile hamburger opens the same controls. Refreshing resets the chats so reviewers can replay the assignment from a clean state. `/` remains a floating alias.

## Validate

From the app folder:

```bash
npm test
npm run typecheck
npm run build
```

GitHub Actions runs these checks on pushes and pull requests.

## Project contents

- [Command menu and shortcuts](docs/design/shortcuts/README.md): functional Search, Command/Control K, keyboard guide, and sidebar refinement.
- [Conversation history implementation and QA](docs/design/conversation-history/README.md): multiple in-session conversations, drafts, sidebar history, and desktop/mobile checks.
- [Separate pages and shared quick views](docs/design/separate-pages/README.md): previous integration and entity-context checks.
- [Entity content research](docs/research/entity-context.md): source-informed fictional coaching and deal context.
- [Earlier conversation layouts](docs/design/implementation-2026-09-10.md): bottom-attached floating chat and an integrated third column, with shared mobile behaviour.
- [Design storyboards](docs/design/conversation-storyboards-2026-09-10.md): the earlier visual comparison and detailed interaction specification.
- [Supporting research](docs/research/persistent-conversation-directions-2026-09-10.md): Mobbin patterns, source evidence, and design tradeoffs.
- `design-engineer-take-home-v3/src/`: the supplied app shell and both working assistant layouts.
- `design-engineer-take-home-v3/mock/`: the fixed answer stream, types, and tests.
- `design-engineer-take-home-v3/public/`: the supplied logo, font, and font license.
- `design-engineer-take-home-v3/package-lock.json`: locked dependencies for reproducible installation.
- `.github/workflows/ci.yml`: validation configured for the app folder.

Source, assets, configuration, tests, and assignment documentation are versioned. Installed dependencies, build output, local environment files, and macOS metadata are excluded.

- [Review fixes and mobile verification](docs/design/review-fixes/README.md): cross-tab persistence, streaming scroll, keyboard focus, and narrow-screen repairs.
- [Coaching surface and motion refinement](docs/design/motion-refinement/README.md): neutral result hierarchy, reversible panel motion, evidence disclosure, reduced-motion behavior, and final desktop/mobile captures.
