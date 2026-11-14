#!/bin/bash
# Restores a backup of production's database from the R2 bucket: downloads the newest backup, or the one named,
# decrypts it with Sarah's age private key and restores it into the database it's pointed at, replacing that
# database's data. The restore test (scripts/restoreTest.ts) and a real restore both use it. See docs/backups.md.
# Usage: pnpm db:restore --to <connection string> [--db <database>] [--production] [<backup name>]
#   --to           the server to restore into, as a connection string whose user can write to the database
#   --db           the database to restore into. Defaults to staging, production's database.
#   --production   required to restore into staging, since it replaces production's data with the backup's
# Reads from Proton Pass with pass-cli, so neither sits in a file:
#   "Meal Planning backup key (age)", the age private key, in its note
#   "Meal Planning backup R2 read token", an R2 token that can read the bucket: the access key ID as its username, the
#   secret access key as its password and the account's R2 endpoint as its website
set -euo pipefail

vault=Development
key_item="Meal Planning backup key (age)"
token_item="Meal Planning backup R2 read token"
bucket=meal-planning-db-backups
production_db=staging

usage() {
  echo "Usage: pnpm db:restore --to <connection string> [--db <database>] [--production] [<backup name>]" >&2
  exit 1
}

to=""
db=$production_db
production=false
name=""
while [ $# -gt 0 ]; do
  case "$1" in
    --to)
      [ $# -ge 2 ] || usage
      to="$2"
      shift 2
      ;;
    --db)
      [ $# -ge 2 ] || usage
      db="$2"
      shift 2
      ;;
    --production)
      production=true
      shift
      ;;
    -*) usage ;;
    *)
      [ -z "$name" ] || usage
      name="$1"
      shift
      ;;
  esac
done
[ -n "$to" ] || usage

if [ "$db" = "$production_db" ] && [ "$production" = false ]; then
  echo "db-restore: $production_db is production's database. Pass --production to replace its data with the backup's." >&2
  exit 1
fi
if [ "$production" = true ] && [ "$db" != "$production_db" ]; then
  echo "db-restore: --production restores only into $production_db, not $db" >&2
  exit 1
fi

pass_field() {
  pass-cli item view --vault-name "$vault" --item-title "$1" --field "$2"
}

# rclone reads a remote named r2 from these, so no config file holds the token.
# no_check_bucket: the token can only reach objects, so rclone mustn't try to check or create the bucket.
export RCLONE_CONFIG_R2_TYPE=s3
export RCLONE_CONFIG_R2_PROVIDER=Cloudflare
RCLONE_CONFIG_R2_ENDPOINT=$(pass_field "$token_item" urls)
RCLONE_CONFIG_R2_ACCESS_KEY_ID=$(pass_field "$token_item" username)
RCLONE_CONFIG_R2_SECRET_ACCESS_KEY=$(pass_field "$token_item" password)
export RCLONE_CONFIG_R2_ENDPOINT RCLONE_CONFIG_R2_ACCESS_KEY_ID RCLONE_CONFIG_R2_SECRET_ACCESS_KEY
export RCLONE_CONFIG_R2_NO_CHECK_BUCKET=true

# Each name leads with its UTC time, so the last one listed is the newest.
if [ -z "$name" ]; then
  name=$(rclone --quiet lsf --files-only "r2:$bucket" | sort | tail -n 1)
  if [ -z "$name" ]; then
    echo "db-restore: the bucket holds no backups" >&2
    exit 1
  fi
fi
echo "db-restore: restoring $name into $db"

encrypted=$(mktemp)
trap 'rm -f "$encrypted"' EXIT
rclone --quiet copyto "r2:$bucket/$name" "$encrypted"

# The key and the decrypted dump never touch disk: the key reaches age on stdin, so the ciphertext goes in as a file,
# and the dump goes straight from age to mongorestore. --drop replaces each collection's data with the backup's.
pass_field "$key_item" note |
  age --decrypt --identity - "$encrypted" |
  mongorestore --uri="$to" --archive --gzip --drop \
    --nsInclude="$production_db.*" --nsFrom="$production_db.*" --nsTo="$db.*"
