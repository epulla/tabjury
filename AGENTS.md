# AGENTS.md

TabJury: browser extension (Chrome MV3, Firefox) that reuses open tabs, flags duplicate
and inactive tabs, and cleans them up based on the chosen mode ("court").
Stack: WXT 0.21, React 19, Tailwind v4, TypeScript, Vitest.

## Commands

Use pnpm for everything. Never npm, npx or yarn. `pnpm-lock.yaml` is the only lockfile.

| Task             | Command                                |
| ---------------- | -------------------------------------- |
| Install          | `pnpm i` (runs `wxt prepare`)          |
| Dev (Chrome)     | `pnpm dev`                             |
| Dev (Firefox)    | `pnpm dev:firefox`                     |
| Type-check       | `pnpm compile`                         |
| Test             | `pnpm test`                            |
| Single test file | `pnpm test tests/dedupe.test.ts`       |
| Build            | `pnpm build` / `pnpm build:firefox`    |
| Zip for store    | `pnpm zip` / `pnpm zip:firefox`        |
| Add dependency   | `pnpm add <pkg>` / `pnpm add -D <pkg>` |
| Run a binary     | `pnpm exec <bin>` or `pnpm dlx <pkg>`  |

Before finishing a change, run `pnpm compile && pnpm test`. The repo has no linter.

## Layout

- `entrypoints/background.ts`: wires dedupe, scanner, alarms (`grace`, `clearBadge`), and the pause command.
- `entrypoints/popup/`: mode picker, automatic cleanup switch, pause, findings, Recently closed (`Bin`), `History`.
- `entrypoints/options/`: full settings form (`Form.tsx`).
- `entrypoints/onboarding/`: first-install page.
- `src/core/`: pure logic, no `browser` calls. Put unit tests here first.
  - `settings.ts`: `Settings` type, `PRESETS`, `DEFAULTS`, `applyPreset`, `withChange`, `migrate`.
  - `url.ts`: `normalizeUrl`, the matching rules.
  - `classify.ts`: `tabKey`, `findDuplicates`, `findInactive`, `isProtected`.
  - `policy.ts`: `decide` turns findings into close/discard actions.
  - `alibi.ts`: exceptions that allow a duplicate to open.
- `src/bg/`: code that uses the browser APIs.
  - `state.ts`: every storage item.
  - `dedupe.ts`: reuse an open tab when a matching one opens.
  - `scanner.ts`: periodic scan and badge count.
  - `actions.ts`: schedule and execute automatic cleanup.
  - `bin.ts`: Recently closed.
- `src/theme.ts`: mode names, colors, and user-facing mode descriptions.
- `src/ui/`: shared React hooks and components (`useItem`, `Switch`).
- `tests/`: Vitest with `wxt/testing/fake-browser`.
- `.agents/skills/`: installed agent skills, pinned in `skills-lock.json`; `.claude/skills/` symlinks to them.

## Domain rules

- Modes: `lite`, `normal`, `ultra`, `custom`. The mode is derived from settings: `withChange`
  recomputes it and switches to `custom` when a preset rule no longer matches. Always write
  settings through `applyPreset` or `withChange`, never by spreading raw objects.
- `autoClean` switch: on by default in Normal and Ultra, off in Custom. Automatic close/discard only runs
  when it is on (`autoOn`).
- Ultra always reuses the open tab. Only pause and protected domains let a duplicate open.
- Settings live in `sync:settings`. When you add or remove a field, update `DEFAULTS` and
  confirm that `migrate` handles the old stored shape.
- Protected tabs (active, pinned, audible, grouped, recently used, domains) are never closed
  or discarded automatically.

## UI copy

- The audience is non-technical. Use plain words that describe what will happen, not
  jargon like "dry run".
- The court theme is fine for mode names, but controls must say exactly what they do.
- No i18n. Strings live inline in the components.

## Git

- Conventional Commits with a scope, e.g. `fix(dedupe): ...`, `feat(ui): ...`.
- Use feature branches and merge through PRs.
