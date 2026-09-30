# TabJury

Every tab gets a fair trial.

TabJury reuses open tabs, flags duplicate and inactive tabs, and recycles them according to your chosen court.

## Modes

| Court         | ID       | Behavior                                                         |
| ------------- | -------- | ---------------------------------------------------------------- |
| Small Claims  | `lite`   | Reuses open tabs.                                                |
| Trial Court   | `normal` | Reuses tabs and flags duplicates and inactive tabs.              |
| Supreme Court | `ultra`  | Reuses tabs, auto-closes duplicates, and discards inactive tabs. |
| Your Court    | `custom` | Uses your settings mix.                                          |

## How it decides

- Matches URLs after stripping tracking parameters and ignoring trailing slashes; hashes stay by default.
- Allows intentional duplicates when the existing tab is active in the same window, opened the link, was used <30s ago, or you re-open within 15s after a reuse ("two strikes").
- Protects the active tab, pinned tabs, tabs playing audio, tabs in groups, tabs used in the last 5 minutes, and domains listed in Settings.
- Auto actions wait 60s, handle at most 5 tabs per scan, start with a 24h practice run where they are only logged, and send closed tabs to Recently closed.

## Known limits

- New tabs briefly flicker before closing because Chrome cannot cancel tab creation.
- Scans run every 30s; browser alarms have a floor.
- Idle timer needs Chrome ≥121 (`lastAccessed`); frozen detection needs Chrome ≥132.
- Chrome exposes no per-tab memory information.
- Chrome Web Store shows "Read your browsing history" because TabJury needs the `tabs` permission.
- Auto-close skips `beforeunload` prompts, so unsaved form data is lost.
- Incognito must be enabled manually and never mixes with normal tabs.
- Same URL with different content cannot be detected; use pause, two strikes, or protected domains.

## Dev

`pnpm i`
`pnpm dev`
`pnpm build`
`pnpm test`
`pnpm zip`

## License

MIT
