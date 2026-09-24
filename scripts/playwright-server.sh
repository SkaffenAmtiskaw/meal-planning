#!/bin/sh
# Manage a background Next.js dev server for Playwright runs by agents.
# Usage: sh scripts/playwright-server.sh start|stop|check
#
# Every action is a single, quote-free command
# so OpenCode permission patterns can match it exactly. Log and pid files live
# inside the repo to avoid external_directory prompts.

set -u
cd "$(dirname "$0")/.." || exit 1

TMP_DIR=.opencode/tmp
PID_FILE="$TMP_DIR/dev.pid"
LOG_FILE="$TMP_DIR/dev.log"
URL=http://localhost:3000
TIMEOUT=90

status_code() {
	curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$URL" || true
}

# Any HTTP response (including auth redirects) means the server is up; 000 means no connection.
is_running() {
	code=$(status_code)
	[ -n "$code" ] && [ "$code" != "000" ]
}

case "${1:-}" in
check)
	if is_running; then
		echo "running: $URL"
	else
		echo "not running"
	fi
	;;

start)
	if is_running; then
		echo "running: dev server already responding at $URL"
		exit 0
	fi
	mkdir -p "$TMP_DIR"
	# Call next directly (not via pnpm) so the recorded pid is the server itself.
	nohup ./node_modules/.bin/next dev >"$LOG_FILE" 2>&1 </dev/null &
	echo $! >"$PID_FILE"
	i=0
	while [ "$i" -lt "$TIMEOUT" ]; do
		if is_running; then
			echo "ready: $URL"
			exit 0
		fi
		sleep 1
		i=$((i + 1))
	done
	echo "timeout: not responding after ${TIMEOUT}s. Last log lines:"
	tail -n 20 "$LOG_FILE"
	exit 1
	;;

stop)
	# Only stops a server this script started; never touches one started by hand.
	if [ -f "$PID_FILE" ]; then
		if kill "$(cat "$PID_FILE")" 2>/dev/null; then
			echo "stopped"
		else
			echo "not running (stale pid file removed)"
		fi
		rm -f "$PID_FILE"
	else
		echo "no pid file: server was not started by this script, leaving it alone"
	fi
	;;

*)
	echo "usage: sh scripts/playwright-server.sh start|stop|check"
	exit 2
	;;
esac