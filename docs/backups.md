# Database Backups
This doc is for restoring production's database when something goes wrong, and for keeping its backups working, which a restore test on your Mac checks every few months. It assumes you know production's data lives in the `staging` database on the Atlas cluster (see `docs/services.md`, "MongoDB Atlas"), and nothing more. You can restore from this doc alone.

# What Gets Backed Up
Every backup is a full dump of `staging`, taken by `.github/workflows/backup.yml` on GitHub. A backup is taken:
- **daily,** at about 04:23 UTC, though GitHub can start a scheduled run late.
- **when a release merges,** meaning a PR from `develop` into `main`, so a release that breaks the data can be undone. A hotfix's merge doesn't take one. To back up before a hotfix, take one by hand.
- **by hand,** from Actions → **Database Backup** → **Run workflow**.

Each dump is encrypted with `age` before it leaves the runner, then uploaded to the private Cloudflare R2 bucket `meal-planning-db-backups`. The bucket deletes each backup 7 days after it lands, so it holds about a week of backups. Since a backup is taken every day, a restore loses at most a day of data. A backup's name starts with its UTC time and says which kind it is, such as `2026-11-14T042317Z-daily.archive.gz.age`.

Only your `age` private key, kept in Proton Pass, can decrypt a backup. So the bucket's tokens alone can't read production's data, and a lost key makes every backup in the bucket useless (see "Replacing a Key or Token").

# Restoring Production
A restore replaces production's data with a backup's. Everything written after that backup was taken is lost, including sign-ins, so anyone signed in since then has to sign in again. The steps, in order:

1. **Pick the backup.** If the newest one is from before the problem started, use it. Otherwise, find the newest one from before the problem: in the Cloudflare dashboard, open R2 → `meal-planning-db-backups` → Objects. The names start with their UTC time. Copy the one you want.
2. **Copy production's connection string.** In Vercel, open the meal-planning project → Settings → Environment Variables → `DB_URL`, and copy its value. It signs in as the `staging` user, which can write to `staging`.
3. **Open a terminal in the main checkout,** `~/repos/meal-planning`, and run `mise install`, so the restore's tools (`age`, `rclone` and `mongorestore`) are installed. The restore reads the private key and your Mac's R2 read token from Proton Pass, so check that `pass-cli` is signed in: run `pass-cli info`, and if it doesn't show your account, run `pass-cli login`.
4. **Run the restore.** If you're restoring the newest backup, leave out `<backup name>`. Otherwise, give the name you copied in step 1. Put the connection string in single quotes, since it holds characters, such as `?` and `&`, that the shell would otherwise treat as part of the command:

   ```bash
   pnpm -s db:restore --to '<DB_URL>' --production <backup name>
   ```

   `--production` is what lets it write over `staging`. Without it, the restore refuses. `-s` keeps pnpm from printing the command, which would show the connection string's password in the terminal.
5. **Check its output.** It starts with `db-restore: restoring <backup name> into staging`, naming the backup it chose, and ends with a line such as `82 document(s) restored successfully. 0 document(s) failed to restore.` If any failed, or the restore stopped with an error, see "When the Restore Test Fails", whose causes are the same.
6. **Check the app.** Open https://www.meal-planning.net, sign in again, and check that your planners and their meals are as they were when the backup was taken.

# When a Backup Fails
A failed backup run reaches you as GitHub's own email for a failed workflow run. Its subject names the **Database Backup** workflow. Open the run from the email and read the failed step's log. The usual causes:
- **`403 Forbidden` from rclone:** the workflow's R2 token was revoked or has expired. Replace it (see `docs/ci.md`, "Replacing the Backup Secrets").
- **An authentication error from `mongodump`:** the Atlas `backup` user's password changed, or the user was removed. Replace `BACKUP_DB_URL` (see `docs/ci.md`, "Replacing the Backup Secrets").
- **A failure while installing tools:** usually a short outage at GitHub or a tool's download site.

Once the cause is fixed, take a backup by hand from Actions → **Database Backup** → **Run workflow**, so the bucket doesn't wait a day for a good one.

GitHub turns off a public repo's scheduled workflows after 60 days with no activity in the repo, and sends no email when it does. The restore test catches it, because the newest backup grows too old. Turn the workflow back on from its page in Actions.

# The Restore Test
`pnpm db:restore-test` (`scripts/restoreTest.ts`) restores the newest backup into a throwaway MongoDB on your Mac. It uses the same `pnpm db:restore` a real restore does, so the restore you'd run in an emergency is the one that was tested. Your Mac runs it every 90 days, and again the next day after a failure (see "The Daily Job"). The test passes only when:
- the newest backup is under 48 hours old, which catches backups that have stopped.
- every collection in the backup restored with no failed documents.
- each collection holds as many documents as the backup did.

A macOS notification titled "Meal Planning backups" says whether it passed, and the full output goes to `~/Library/Logs/meal-planning-restore-test.log`.

To run it now, whatever the date, run `pnpm -s db:restore-test --now` from the main checkout.

## The Daily Job
A LaunchAgent starts the test from the main checkout every day at noon, and the test itself decides whether it's due. After a pass, the test writes the date to `~/Library/Application Support/meal-planning/restore-test-last-pass`, and runs again only once that date is 90 days old. A failed test writes nothing, so it runs again the next day. If your Mac is asleep at noon, the job runs when the Mac wakes. It runs only while you're logged in, because it uses `pass-cli`'s signed-in session. The job is defined in `scripts/restore-test.plist`, installed as `~/Library/LaunchAgents/net.meal-planning.restore-test.plist`.

To install it on a Mac, run these from the main checkout:

```bash
cp scripts/restore-test.plist ~/Library/LaunchAgents/net.meal-planning.restore-test.plist
```

```bash
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/net.meal-planning.restore-test.plist
```

When `scripts/restore-test.plist` changes, copy it again, then unload the old job with `launchctl bootout gui/$(id -u)/net.meal-planning.restore-test` and run the `bootstrap` command again. launchd keeps running the copy it loaded until you do.

## When the Restore Test Fails
The notification gives the first problem, and the log gives them all. The causes, by what the notification says:
- **The newest backup is too many hours old:** the backups have stopped. Check Actions → **Database Backup** for failed runs, or for the workflow being turned off (see "When a Backup Fails").
- **`db-restore exited` with an error from `pass-cli` about the session:** `pass-cli` is signed out. Run `pass-cli login`.
- **`db-restore exited` with `No item found with title`:** a Proton Pass item was renamed or moved out of the Development vault. The restore reads "Meal Planning backup key (age)" and "Meal Planning backup R2 read token" by those names.
- **`db-restore exited` with `403 Forbidden`:** your Mac's R2 read token was revoked or has expired. Replace it (see "Replacing a Key or Token").
- **`db-restore exited` with an error from `age`:** the private key in Proton Pass doesn't match the public key the backups are encrypted to. Check that the note of "Meal Planning backup key (age)" holds the whole key, and that `BACKUP_AGE_RECIPIENT` is the public key `age-keygen -y` derives from it.
- **A collection failed to restore, or holds the wrong number of documents:** the backup itself may be damaged. Take a backup by hand, then run the test again with `--now`. If the new backup fails too, read the log's `mongorestore` errors.

Once the cause is fixed, run `pnpm -s db:restore-test --now` from the main checkout, and check that it passes.

# Replacing a Key or Token
The backups depend on four credentials outside the repo. GitHub holds two of them, the workflow's R2 token and the `backup` user's connection string. Replace those as `docs/ci.md`, "Replacing the Backup Secrets", describes. Replace the other two as below.

## The `age` Key Pair
Replace the key pair if the private key is lost or has leaked, meaning anyone else may have seen it. The steps, in order:
1. On your Mac, run `age-keygen`. It prints a public key in a comment, then the private key.
2. In Proton Pass, in the Development vault, replace the note of "Meal Planning backup key (age)" with the whole private key, `AGE-SECRET-KEY-…`.
3. In GitHub → Settings → Secrets and variables → Actions → Variables, set `BACKUP_AGE_RECIPIENT` to the new public key, `age1…`.
4. Take a backup by hand, from Actions → **Database Backup** → **Run workflow**, then run `pnpm -s db:restore-test --now` and check that it passes.
5. **Deal with the backups taken before the change.** They open only with the old key. If it leaked, anyone with it and a bucket token could read them, so delete them from R2 → `meal-planning-db-backups` → Objects. Otherwise, leave them: they age out of the bucket within 7 days.

## Your Mac's R2 Read Token
Replace it if it's revoked, expires or leaks. The steps, in order:
1. In the Cloudflare dashboard, open R2 → **Manage API tokens** → **Create Account API token**. Give it **Object Read only** permission, scoped to the `meal-planning-db-backups` bucket only.
2. In Proton Pass, in the Development vault, update the login "Meal Planning backup R2 read token": its username is the token's Access Key ID, and its password is its Secret Access Key. Its website stays the account's R2 endpoint, `https://<account ID>.r2.cloudflarestorage.com`.
3. Delete the old token on the same Cloudflare page.
4. Run `pnpm -s db:restore-test --now` and check that it passes.

# Where Each Setting Is Recorded
The settings outside the repo that the backups rely on are recorded with their service:
- the Atlas `backup` user, in `docs/services.md`, "MongoDB Atlas".
- the R2 bucket, its lifecycle rule and both R2 tokens, in `docs/services.md`, "Cloudflare".
- the private key and your Mac's R2 read token, in `docs/services.md`, "Proton Pass".
- the workflow's Actions secrets and variables, in `docs/ci.md`, "Database Backup".
