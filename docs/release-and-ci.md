# Release & CI

## Workflows
- `.github/workflows/ci.yml` — on PR/push: install, type-check, Vitest, build. Fails the check if any step fails.
- `.github/workflows/release.yml` — on tag `v*`:
  1. Build.
  2. Inject `url`, `manifest`, `download`, and the tag's version into `dist/module.json`.
  3. Zip `dist/` as `module.zip`.
  4. Create a GitHub Release and attach `module.json` + `module.zip`.
  5. (Optional) Notify the Foundry package registry via the release API.

## Tagging
- Use semver: `vMAJOR.MINOR.PATCH`. The tag drives the version written into `module.json`.
- Update `CHANGELOG.md` **before** tagging. CI reads the matching section for the release body.
- Never re-use a tag — Foundry caches `module.json` by download URL; re-tagging breaks clients mid-update.

## `module.json` URL convention
- `manifest` → points to the **latest** `module.json` (a stable URL, e.g. `releases/latest/download/module.json`). Enables "Check for Updates" in Foundry.
- `download` → points to the **current version's** zip (versioned URL). Ensures correct artifact per version.

## Foundry package registry
- First publish is manual on foundryvtt.com; subsequent versions can be submitted via their API. Credentials live in `FOUNDRYVTT_TOKEN` as a GitHub repo secret. The release workflow calls the API only if the secret is set.

## Pre-release checklist
- `compatibility.verified` bumped to the Foundry version actually tested.
- `CHANGELOG.md` entry present.
- No debug flags left on (`CONFIG.debug.*`).
- `id` unchanged since last release.