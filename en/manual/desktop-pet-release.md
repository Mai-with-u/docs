---
title: Building Pet Installers Manually
---

# Building Pet Installers Manually

Trigger `.github/workflows/publish-pet-clients.yml` by hand to get a Windows x64 installer and a signed Android APK, attached automatically to the current stable Release. The workflow is independent of the main-program release flow and supports manual startup only.

## Configure the signing secrets

Add the Android signing secrets under **Settings → Secrets and variables → Actions** in the repository:

::: fields
- **`MAIBOT_ANDROID_KEYSTORE_BASE64`** — Base64 content of the existing production signing keystore file.
- **`MAIBOT_ANDROID_STORE_PASSWORD`** — The keystore password.
- **`MAIBOT_ANDROID_KEY_ALIAS`** — The signing key alias.
- **`MAIBOT_ANDROID_KEY_PASSWORD`** — The key password; omit it when it matches the keystore password.
:::

Use the signing key of an existing Android release so users can upgrade in place. Never commit the signing file or its passwords to the repository. When any of the first three secrets is missing, the build fails immediately and names the missing one.

## Start the build

Merge the workflow into the default branch, then run **Actions → Build Pet Clients (Manual) → Run workflow** against the default branch.

At startup the workflow looks up the latest stable GitHub Release, excluding drafts and pre-releases, and locks its tag and source commit. The build source comes from that Release, so local or branch changes that never entered the tag are not part of the installer; each client keeps its own version configuration from that tag.

Two Windows runners build the Windows x64 installer and the signed Android APK in parallel without waiting on each other; Android also runs lint and APK signature verification. A separate `verify_android_only` input builds and verifies the Android APK without attaching it to a Release.

## Build outputs

When the build finishes, the installers and their `.sha256` files are attached to the locked Release. Publishing a newer Release in the meantime does not change the upload target.

One failing platform does not cancel the other, and the successful platform's packages are still uploaded; read the failure reason in the Actions log. Build outputs are also kept as Actions artifacts for 30 days.

Assets with the same name and the same content are skipped, while the same name with different content fails explicitly so a published installer is never overwritten. To ship a change, bump that client's version so it enters the target Release.

The workflow creates no Release, modifies no release notes, and neither triggers nor blocks the existing main-program release workflows.

## Sync to CNB

The standalone `.github/workflows/cnb-releases.yml` (**Sync Releases to CNB**) runs after the pet build or main-program release workflow completes, and also reacts to GitHub Release publish/edit events and manual runs. Even when only one pet platform succeeded, the assets attached to the GitHub Release are synced.

The sync reuses the existing `CNB_TOKEN`, `CNB_GROUP`, and optional `CNB_MAIBOT_REPO` configuration. Besides the existing code-mirror permissions, `CNB_TOKEN` needs `repo-release:rw` on the target repository. The workflow must be merged into the default branch to receive `workflow_run` events.

The sync first reuses the code-mirror script to prepare branches, tags, and LFS, then scans every non-draft GitHub Release, creates or updates the matching CNB version's title, notes, pre-release state, and latest flag, and fills in all Release assets including the pet EXE, APK, and checksum files. Scanning every version keeps concurrent releases from dropping older versions locked by earlier builds. GitHub Release is the only data source: artifacts from the triggering build are not read, and the sync code always runs from the default branch.

Assets are verified by SHA256; identical content is skipped and the same name with different content fails. Existing CNB versions and assets are never deleted. Uploads use presigned URLs from the CNB official OpenAPI, are confirmed and verified on completion, and are stored permanently.

<Linkcard url="https://api.cnb.cool/" title="CNB OpenAPI" description="The official CNB API docs; release asset uploads go through the presigned URLs documented here" />

Sync failures are reported in the standalone workflow and in the `cnb-release-sync-status` artifact, and do not affect the GitHub release or the pet build result. After fixing permissions or network issues, run **Sync Releases to CNB** manually to catch up; no rebuild is needed. This flow shares a concurrency lock with the code mirror so tag sync and Release creation never race.

## Verify and troubleshoot

**Verification** — run **Build Pet Clients (Manual)** once: the resolve job locks the tag first, and after both platform jobs finish, the target Release's asset list should contain the installer, the APK, and their `.sha256` files.

- **The Android step reports a missing secret** — the first three Android secrets are required; only `MAIBOT_ANDROID_KEY_PASSWORD` may stay empty when it matches the keystore password.
- **The installer misses the latest commit** — the build source is the locked stable Release tag, so changes outside that tag are excluded; merge them into the target Release first.
- **Upload fails with "same name, different content"** — an identically named asset already exists with different content and the workflow refuses to overwrite it; bump the client version and publish again.
- **Only one platform produced packages** — platforms do not cancel each other; read the failing platform's job log, and the other platform's packages are unaffected.
- **No new version or assets on CNB** — confirm `CNB_TOKEN` has `repo-release:rw`, `CNB_GROUP` is set, and the workflow is merged into the default branch, then run **Sync Releases to CNB** manually.
- **CNB sync failed but GitHub is fine** — the two are independent; failure details are in the sync workflow and the `cnb-release-sync-status` artifact, so rerun the sync after fixing permissions.
