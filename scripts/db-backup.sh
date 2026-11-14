#!/bin/bash
# Backs up production's database (`staging`) to the R2 bucket: dumps it, encrypts the dump to Sarah's age public key
# and uploads it. The backup workflow runs it (.github/workflows/backup.yml). See docs/backups.md.
# Usage: pnpm db:backup daily|release
# Reads from the environment:
#   BACKUP_DB_URL          the Atlas `backup` user's connection string, with no database in its path
#   BACKUP_AGE_RECIPIENT   the age public key each dump is encrypted to
#   R2_BUCKET              the bucket's name
#   R2_ENDPOINT            the account's R2 endpoint, https://<account ID>.r2.cloudflarestorage.com
#   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY   an R2 token that can write to the bucket
set -euo pipefail

kind="${1:-}"
case "$kind" in
  daily | release) ;;
  *)
    echo "Usage: pnpm db:backup daily|release" >&2
    exit 1
    ;;
esac

for var in BACKUP_DB_URL BACKUP_AGE_RECIPIENT R2_BUCKET R2_ENDPOINT R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "db-backup: $var isn't set" >&2
    exit 1
  fi
done

# rclone reads a remote named r2 from these, so no config file holds the token.
# no_check_bucket: the token can only reach objects, so rclone mustn't try to check or create the bucket.
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
export RCLONE_CONFIG_R2_ENDPOINT="$R2_ENDPOINT"
export RCLONE_CONFIG_R2_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export RCLONE_CONFIG_R2_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

# The UTC time leads the name, so the bucket lists backups oldest to newest.
name="$(date -u +%Y-%m-%dT%H%M%SZ)-$kind.archive.gz.age"

encrypted=$(mktemp)
trap 'rm -f "$encrypted"' EXIT

# The unencrypted dump never touches disk: it goes straight from mongodump to age. The encrypted dump is uploaded only
# once every step has passed, since a dump that fails partway still ends its stream, and an upload reading straight
# from the pipe would finish with a cut-off backup.
mongodump --uri="$BACKUP_DB_URL" --authenticationDatabase=admin --db=staging --archive --gzip --quiet |
  age --encrypt --recipient "$BACKUP_AGE_RECIPIENT" --output "$encrypted"

rclone copyto "$encrypted" "r2:$R2_BUCKET/$name"
echo "db-backup: uploaded $name ($(wc -c < "$encrypted" | tr -d ' ') bytes)"
