# ⚖️ TabJury

**Your tabs. Your rules. The jury decides.**

Meet TabJury, the jury for your browser tabs. Each tab gets a fair hearing: still in use,
repeated, or left unused? You choose the court and set the rules. The jury decides what
stays open, what goes to sleep, and what closes.

## What TabJury does

TabJury is a browser extension for Chrome and Firefox that helps you manage tab clutter.

- **Reuses open tabs** when you open the same link again.
- **Finds duplicates** and flags or closes extra copies, depending on your court.
- **Checks inactive tabs** and puts them to sleep or closes them according to your rules.
- **Respects your protections**, keeping protected tabs out of automatic cleanup.
- **Lets you call Recess** to pause tab reuse and scheduling of automatic cleanup.

Putting a tab to sleep unloads its page while leaving the tab open; selecting it loads
the page again. Closing removes the tab. Your chosen court determines which actions
TabJury takes.

## Try it locally

**TabJury is not published in browser stores yet. It is being prepared for release.**
For now, build and load it locally for testing. You'll need Git, Node.js, and pnpm
(the version used by this project is pinned in `package.json`).

```sh
git clone https://github.com/epulla/tabjury.git
cd tabjury
pnpm i
```

### Chrome

1. Run `pnpm build`.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select this project's `.output/chrome-mv3` folder.
4. Open TabJury from the extensions menu, choose a court, and review Settings.

### Firefox

1. Run `pnpm build:firefox`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on** and select
   `.output/firefox-mv2/manifest.json` in this project.
4. Open TabJury from the extensions menu, choose a court, and review Settings.

Firefox removes temporary add-ons when the browser restarts; load it again to continue
testing.

## 🏛️ Choose your court

| Court | Mode | What happens |
| --- | --- | --- |
| Claims Court | `lite` | Reuses open tabs and flags duplicates. No automatic cleanup of existing tabs. |
| Trial Court | `normal` | Reuses open tabs, flags duplicates, and puts inactive tabs to sleep. Never automatically closes existing tabs. |
| Supreme Court | `ultra` | Reuses open tabs across windows, automatically closes extra duplicates, and closes tabs left idle past your limit. Inactive tabs can sleep before that limit. |
| Your Court | `custom` | Lets you choose your own mix of reuse, detection, sleep, and closing rules in Settings. |

**Trial Court is the default.** Automatic cleanup starts on in Trial Court and Supreme
Court, and off when you select Your Court. Changing reuse, duplicate, or inactivity
rules away from a preset switches to Your Court.

## How the jury decides

### Same link, same tab

By default, TabJury compares links after removing common tracking parameters and
ignoring trailing slashes. Page fragments (`#...`) and other query parameters still
count. You can change these matching rules in Settings.

Tab reuse normally looks within the current window; duplicate detection looks across
all windows. Both scopes are configurable. Supreme Court always checks all windows
when reusing a tab. When a match is in another window, TabJury can focus that window
or move the existing tab into yours.

Lite, Normal, and Custom allow intentional duplicates when you use the browser's
Duplicate Tab action or open the same link again within 15 seconds after a reuse
("two strikes"). Outside Ultra, the popup also briefly offers **Open as new tab anyway**.
Supreme Court always reuses a matching open tab, except during Recess or for protected
websites. Turning automatic cleanup off does not turn tab reuse off.

### Left unused

TabJury checks when a tab was last used and whether the browser has already put it to
sleep or frozen it. By default, either signal can mark a tab inactive. Settings lets
you require the idle timer, the browser signal, or both.

- **60 minutes unused:** the default idle threshold for putting tabs to sleep.
- **120 minutes unused:** the default idle-close threshold in Supreme Court.
- Already sleeping tabs can still be closed once they pass the idle-close threshold.

Both timers are adjustable in Settings; Supreme Court also lets you change the closing
limit from the popup. Tabs without a reported last-used time are never automatically
closed for being idle.

### Protected from automatic cleanup

By default, TabJury keeps these tabs out of automatic closing and sleeping:

- The active tab.
- Pinned tabs.
- Tabs playing audio.
- Tabs in groups.
- Tabs used in the last **5 minutes**.

These protections are configurable. You can also add protected websites in Settings;
those sites are exempt from automatic cleanup and tab reuse.

Protections apply to automatic cleanup. Manual **Close** and **Discard** controls in
the popup act on the tabs you choose.

### Automatic cleanup

Automatic closing and sleeping only run when the automatic cleanup switch is on and
your rules include those actions. By default, TabJury waits **60 seconds** before
acting and handles at most **5 tabs per scan**. Both values are configurable.

The popup shows duplicates, inactive tabs, and pending cleanup. You can focus a listed
tab, close extra duplicates, put inactive tabs to sleep, or close selected tabs yourself.

## ☕ Recess, recovery, and history

- **Recess:** pause tab reuse and scheduling of new automatic cleanup for **5, 15, or
  60 minutes**. Choose **Resume** to end it early. **Alt+Shift+P** toggles a 15-minute
  recess when the browser shortcut is available.
- **Recently closed:** restore tabs TabJury removed during reuse or cleanup, including
  manual closing from its popup. Default retention settings are **14 days** and **500
  entries**; old entries are pruned when another entry is added. Restore tries the
  browser's saved session first, then reopens the link if that session is unavailable.
- **History:** see the latest **200 automatic cleanup actions**, with the tab, time,
  and whether it was a duplicate or inactive. You can clear History and Recently closed
  separately.

## Known limits

- A new duplicate tab may briefly appear before TabJury reuses the existing tab;
  Chrome cannot cancel tab creation.
- Periodic scans run every **30 seconds**, with additional scans after tab changes.
  Browser alarm timing means cleanup is not instantaneous.
- Idle timing relies on the browser reporting `lastAccessed` (Chrome **121+**).
  Frozen-tab detection needs Chrome **132+**. Available signals differ by browser.
- Recess stops new cleanup from being scheduled; cleanup already scheduled can still
  run. Turn automatic cleanup off to cancel pending automatic actions.
- Auto-close bypasses unsaved-change prompts (`beforeunload`), so unsaved form data
  can be lost. Restoring a link does not guarantee recovery of that data.
- Chrome exposes no per-tab memory information, so TabJury does not report memory savings.
- The `tabs` permission can trigger a browser warning about reading browsing history;
  it is needed to identify open tabs and their links.
- Incognito access must be enabled manually. Tab reuse and duplicate matching never
  mix incognito tabs with normal tabs.
- Different content at the same link cannot be distinguished. Use protected websites,
  Recess, or the intentional-duplicate exceptions when you need separate copies.

## 🛠️ Development

Built with WXT 0.21, React 19, TypeScript, Tailwind CSS v4, and Vitest. Use pnpm for all
commands; see [AGENTS.md](AGENTS.md) for project conventions.

| Task | Chrome / shared | Firefox |
| --- | --- | --- |
| Install dependencies | `pnpm i` | Same |
| Start development | `pnpm dev` | `pnpm dev:firefox` |
| Type-check | `pnpm compile` | Same |
| Run tests | `pnpm test` | Same |
| Build | `pnpm build` | `pnpm build:firefox` |
| Package for store submission | `pnpm zip` | `pnpm zip:firefox` |

Before submitting changes, run:

```sh
pnpm compile && pnpm test
```

Builds and ZIP packages are written to `.output/`.

## License

[MIT](LICENSE)
