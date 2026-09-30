---
name: release
description: Cut a TabJury release - bump the version, build Chrome and Firefox zips with pnpm, tag, and publish a GitHub release with gh. Use ONLY when the user asks to release, publish, tag, or ship a new TabJury version.
---

# Release

Use pnpm only. Releases are cut from `main`.

## 1. Check the state

- `git switch main && git pull --ff-only`
- `git status --short` must be empty. Stop if it is not.
- `gh auth status` must be logged in.
- Last release: `git describe --tags --abbrev=0` (none means this is the first release).

## 2. Pick the version

- Read `git log <last-tag>..HEAD --oneline`. With no commits since the last tag, stop: nothing to release.
- Semver from Conventional Commits: breaking change -> major, `feat` -> minor, only `fix`/others -> patch.
- Confirm the version with the user before continuing.
- Set `"version"` in `package.json` (WXT copies it into the manifest and the zip names).
- Commit on `main`: `chore(release): vX.Y.Z`, then `git push`.
- First release: if `package.json` already has the version you want, skip the bump.

## 3. Verify and build

```sh
pnpm compile && pnpm test
rm -f .output/*.zip
pnpm zip && pnpm zip:firefox
ls .output/*.zip
```

Expect three files: `tabjury-X.Y.Z-chrome.zip`, `tabjury-X.Y.Z-firefox.zip`, `tabjury-X.Y.Z-sources.zip`
(Firefox add-on review needs the sources zip). Stop if any is missing or the version is wrong.

## 4. Publish

Write notes for a non-technical audience: plain words describing what changed for the user, no
commit hashes or jargon. Group as `## New`, `## Fixed`, `## Changed` (omit empty groups), then:

```md
## Install
- Chrome: unzip `tabjury-X.Y.Z-chrome.zip`, then `chrome://extensions` > Developer mode > Load unpacked.
- Firefox: `about:debugging` > Load Temporary Add-on > pick the zip.
```

```sh
gh release create vX.Y.Z --target main --title "vX.Y.Z" --notes "<notes>" \
  .output/tabjury-X.Y.Z-chrome.zip .output/tabjury-X.Y.Z-firefox.zip .output/tabjury-X.Y.Z-sources.zip
```

## 5. Report

Give the release URL and the three attached files. Remind the user that the store submissions
(Chrome Web Store, AMO) are manual.
