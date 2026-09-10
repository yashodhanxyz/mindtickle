# Mindtickle design engineer assignment

Private workspace for the Aria Sales Hub AI Assistant take-home assignment.

The [original assignment README](design-engineer-take-home-v3/README.md) is the source of truth for scope, required behaviour, and submission guidance. The starter app lives in `design-engineer-take-home-v3/`.

## Run locally

```bash
cd design-engineer-take-home-v3
npm ci
npm run dev
```

## Validate

From the app folder:

```bash
npm test
npm run typecheck
npm run build
```

GitHub Actions runs these checks on pushes and pull requests.

## Project contents

- [Current conversation storyboards](docs/design/conversation-storyboards-2026-09-10.md): floating chat and an integrated third column, with shared mobile behaviour; layout selection pending.
- [Supporting research](docs/research/persistent-conversation-directions-2026-09-10.md): Mobbin patterns, source evidence, and design tradeoffs.
- `design-engineer-take-home-v3/src/`: the supplied app shell and assistant placeholder.
- `design-engineer-take-home-v3/mock/`: the fixed answer stream, types, and tests.
- `design-engineer-take-home-v3/public/`: the supplied logo, font, and font license.
- `design-engineer-take-home-v3/package-lock.json`: locked dependencies for reproducible installation.
- `.github/workflows/ci.yml`: validation configured for the app folder.

Source, assets, configuration, tests, and assignment documentation are versioned. Installed dependencies, build output, local environment files, and macOS metadata are excluded.
