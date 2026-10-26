# Close leftover tabs from app launchers

## Request

"Close the leftover tabs that 'open in the app' links leave behind. Example: a Zoom link opens
`zoom.us/j/<id>`, Zoom's desktop app starts, and the 'Launch Meeting' tab stays open forever.
Same for Teams, Slack and similar apps."
"Also can we seek for Slack and other leftovers (we can base on
https://github.com/babraham123/app-tab-cleaner)."

## Decisions

- Leftover tabs bypass `protect.active` and `protect.recentMinutes`; pinned, audible, grouped
  and protected domains still apply.
- Courts: Claims `detect`, Trial `detect`, Supreme `close`. `applyPreset` sets it, but
  `leftovers` is not part of mode derivation (`withChange`) and `migrate` does not force it.
- A tab counts once it matches and `now - tab.lastAccessed >= seconds` (default 30); tabs
  without `lastAccessed` are skipped. No new storage item. Leftover actions skip
  `auto.graceSeconds`.
- Built-in rules (regex, marker-based, from app-tab-cleaner): Zoom `/j|s|w/…#success`
  (zoom.us, zoomgov.us), Slack `archives/ | app_redirect | ssb/(signin_)?redirect`, Teams
  `/dl/launcher/launcher.html?`, Notion `/native/…deepLinkOpenNewTab=true`, Linear
  `noRedirect=1` (excluding settings/integrations), Discord invites. No Webex, Figma or Spotify.
- Custom patterns: globs like `*.zoom.us/j/*`, matched against host + path.
- Honors the `autoClean` switch; with it off, leftover tabs only show in the popup.
- Closing the last tab in a window opens a new tab first.
- No README credit line. No new permission, so `PRIVACY.md` only changes if a storage item
  needs listing.
- This plan file is deleted in the last task's commit.

## Tasks

- [x] Core: `src/core/leftovers.ts` (built-in rules, glob matching, `findLeftovers(tabs, s, now)`)
      and `Settings.leftovers: { level, seconds, extra }` with `PRESETS`, `DEFAULTS`,
      `applyPreset`, `withChange`, `migrate`. Check: `pnpm test tests/leftovers.test.ts tests/settings.test.ts`
      (Zoom `#success` yes, Zoom without `#success` no, `/wc/` no, glob extra yes, old stored shape migrates,
      changing leftovers keeps the mode).
- [x] Background: `decide` gets reason `'leftover'` (protection bypass as decided, batch cap);
      scanner reports leftovers in findings and badge; `autoOn` includes
      leftovers; leftover actions run without grace; last tab in window gets a new tab first;
      Recently closed and History accept the new reason. Check: `pnpm test tests/policy.test.ts tests/actions.test.ts tests/scanner.test.ts`.
- [ ] UI and docs: popup "Left behind by apps" findings section, Settings level/seconds/custom
      patterns in `entrypoints/options/Form.tsx`, README "How the jury decides" + Known limits,
      `PRIVACY.md` if needed. Check: `pnpm compile` and a look at popup/options in `pnpm dev`.
- [ ] Verify and clean up: `pnpm compile && pnpm test`; manual: in Supreme Court open a Zoom
      meeting link, the app launches, the tab closes in ~30–60s and is in Recently closed; a
      `/wc/` meeting tab stays. Delete this plan file. Check: all green + manual results noted on PROJ-69.
