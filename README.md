# TabJury

Every tab gets a fair trial.

TabJury reuses open tabs, flags duplicate and inactive tabs, and recycles them according to your chosen court.

## Modes

| Court         | ID       | Behavior                                                         |
| ------------- | -------- | ---------------------------------------------------------------- |
| Claims Court   | `lite`   | Reuses open tabs and flags duplicate tabs.                       |
| Trial Court   | `normal` | Everything in Claims Court, plus puts inactive tabs to sleep.    |
| Supreme Court | `ultra`  | Reuses tabs, auto-closes duplicates, and closes tabs left idle too long. |
| Your Court    | `custom` | Uses your settings mix.                                          |

## How it decides

- Matches URLs after stripping tracking parameters and ignoring trailing slashes; hashes stay by default.
- Allows intentional duplicates in Lite, Normal and Custom when you duplicate a tab or re-open the same link within 15s after a reuse ("two strikes"). Ultra always reuses the open tab. Recess and protected domains always allow duplicates.
- Protects the active tab, pinned tabs, tabs playing audio, tabs in groups, tabs used in the last 5 minutes, and domains listed in Settings.
- Auto actions run only when the automatic cleanup switch is on (on by default in Normal and Ultra, off in Custom). They wait 60s, handle at most 5 tabs per scan, and send closed tabs to Recently closed.

## Known limits

- New tabs briefly flicker before closing because Chrome cannot cancel tab creation.
- Scans run every 30s; browser alarms have a floor.
- Idle timer needs Chrome ≥121 (`lastAccessed`); frozen detection needs Chrome ≥132.
- Idle close needs `lastAccessed` (Chrome ≥121); tabs without it are never closed for being idle.
- Chrome exposes no per-tab memory information.
- Chrome Web Store shows "Read your browsing history" because TabJury needs the `tabs` permission.
- Auto-close skips `beforeunload` prompts, so unsaved form data is lost.
- Incognito must be enabled manually and never mixes with normal tabs.
- Same URL with different content cannot be detected; use recess, two strikes, or protected domains.

## Dev

`pnpm i`
`pnpm compile`
`pnpm dev`
`pnpm build`
`pnpm test`
`pnpm zip`

Use pnpm only; see AGENTS.md.

## License

MIT
