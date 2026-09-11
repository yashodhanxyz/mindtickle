# Aria Sales Hub — Mindtickle assignment

A conversational coaching experience for Jordan, a sales manager reviewing Marcus’s discovery calls. Built with React, TypeScript, and Vite inside the supplied Aria shell.

## Try the two options

| Option | Live preview | Approach |
| --- | --- | --- |
| Floating chat | [Open floating chat](https://mindtickle-xi.vercel.app/floating) | Bottom-attached chat that can be minimised while working. |
| Integrated column | [Open integrated column](https://mindtickle-xi.vercel.app/column) | Chat opens beside the workspace, which reflows to make room. |

Both adapt to a full-height conversation on mobile. Each route is a separate concept with its own in-session chat history; there is no layout switch inside the experience.

## How I approached the assignment

I started with the supplied README and tried using Mobbin MCP and AI to research and develop options. The initial concepts were too focused on displaying one answer. I broke the journey into smaller parts: ask, read, inspect evidence, follow up, and return to work. That led to the two conversational layouts above.

I then refined the experience through desktop and mobile reviews: keeping chat visually part of Aria, placing evidence beneath the relevant scores, preserving conversations and drafts, and improving opening, closing, minimising, and streamed replies. AI helped with implementation and review; I directed the interaction decisions and revisions.

Read [DECISIONS.md](design-engineer-take-home-v3/DECISIONS.md) for the short personal account, priorities, and next improvements. The [original assignment brief](design-engineer-take-home-v3/README.md) remains unchanged.

## Run locally

Use **Node.js 22** and npm, matching CI. A root `.nvmrc` is included for nvm users. No API keys, environment variables, or backend setup are needed.

```bash
git clone https://github.com/yashodhanxyz/mindtickle.git
cd mindtickle
# If you use nvm:
nvm install
nvm use
cd design-engineer-take-home-v3
npm ci
npm run dev
```

Cloning requires access to this private repository. If you received a source ZIP, extract it and start from the app folder instead.

Open the URL printed by Vite (normally `http://localhost:5173`) with `/floating` or `/column` appended. `/` also opens the floating option. If the port is occupied, use the port Vite prints.

## Walk through the experience

1. Start a chat using the supplied question: **“How is Marcus doing on discovery calls this quarter?”**
2. Watch the progress status, answer, and coaching card arrive.
3. Select **View evidence** beside **Skill assessment** to inspect the support beneath each score.
4. Ask a follow-up, such as **“What supports the stakeholder-discovery concern?”**
5. Minimise and restore floating chat, or close either option and reopen it from sidebar history. On mobile, use the hamburger menu to reach history.
6. Refresh to reset the demo and try again.

The original answer uses the supplied fixed stream and unchanged coaching data. Follow-ups are bounded local demo replies, not a connected AI model. Extra entity context is fictional. Chats and drafts last for the page session; refresh clears them. Host navigation is demonstration context, not a complete sales application.

## Checks and production build

Run these from `design-engineer-take-home-v3/`:

```bash
npm test
npm run typecheck
npm run build
npm run preview
```

`preview` serves the production build locally; use its printed URL with either route. GitHub Actions runs a clean install, tests, type checking, and build on pushes and pull requests.

Browser QA from development is recorded in the [QA log](design-engineer-take-home-v3/design-qa.md). Physical-phone keyboards and actual screen-reader behaviour still need validation.

## Repository guide

- `design-engineer-take-home-v3/src/` — assistant, shell integration, conversation state, styles, and tests. Start with `AssistantExperience.tsx` and `App.tsx`.
- `design-engineer-take-home-v3/mock/` — supplied answer stream, types, and contract tests.
- `design-engineer-take-home-v3/public/` — supplied brand assets and font licence.
- [Design and research notes](docs/README.md) — supporting iteration history, screenshots, and checks.
- `.github/workflows/ci.yml` — automated validation.

For Vercel, set the project Root Directory to `design-engineer-take-home-v3`. Its `vercel.json` supports direct visits and refreshes on both routes.
