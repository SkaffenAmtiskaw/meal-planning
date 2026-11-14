// Tests that the newest backup in the R2 bucket restores: starts a throwaway MongoDB, restores the backup into it with
// scripts/db-restore.sh, checks the data and throws the database away. It restores locally because the Free Atlas
// cluster's storage would count a second copy of production. A macOS notification says whether it passed.
// The daily LaunchAgent (scripts/restore-test.plist) starts it from the main checkout and appends its output to
// ~/Library/Logs/meal-planning-restore-test.log. It runs only when its last pass was RUN_EVERY_DAYS or more ago, so a
// failed test runs again the next day. See docs/backups.md.
// Usage: pnpm -s db:restore-test [--now]
//   --now   runs whatever the date

import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

const RUN_EVERY_DAYS = 90;
// A daily backup is at most a day old, so an older newest backup means the backups have stopped, such as when GitHub
// turns off a scheduled workflow after 60 days without repo activity, which sends no failure email.
const MAX_BACKUP_AGE_HOURS = 48;
const DATABASE = 'restore-test';
const LAST_PASS_FILE = path.join(
	homedir(),
	'Library/Application Support/meal-planning/restore-test-last-pass',
);
const DAY_MS = 24 * 60 * 60 * 1000;

const { values } = parseArgs({
	options: { now: { type: 'boolean', default: false } },
});

if (!values.now && !isDue()) {
	process.exit(0);
}

console.log(`restore-test: started ${new Date().toISOString()}`);
const problems = await runTest();
if (problems.length === 0) {
	mkdirSync(path.dirname(LAST_PASS_FILE), { recursive: true });
	writeFileSync(LAST_PASS_FILE, new Date().toISOString());
	console.log('restore-test: passed');
	notify('Restore test passed');
} else {
	for (const problem of problems) {
		console.error(`restore-test: FAILED: ${problem}`);
	}
	notify(`Restore test failed: ${problems[0]}`);
	process.exitCode = 1;
}

function isDue(): boolean {
	let lastPass: Date;
	try {
		lastPass = new Date(readFileSync(LAST_PASS_FILE, 'utf8').trim());
	} catch {
		return true;
	}
	return (
		Number.isNaN(lastPass.getTime()) ||
		Date.now() - lastPass.getTime() >= RUN_EVERY_DAYS * DAY_MS
	);
}

async function runTest(): Promise<string[]> {
	const server = await MongoMemoryServer.create();
	try {
		const uri = server.getUri();
		const restore = await runRestore(uri);
		if (restore.exitCode !== 0) {
			const lastLine = restore.output.trim().split('\n').at(-1);
			return [`db-restore exited with code ${restore.exitCode}: ${lastLine}`];
		}
		return [
			...checkBackupAge(restore.output),
			...(await checkCollections(restore.output, uri)),
		];
	} catch (error) {
		return [error instanceof Error ? error.message : String(error)];
	} finally {
		await server.stop();
	}
}

// Runs db-restore.sh, echoing its output as it goes, so the log holds it in full.
function runRestore(
	uri: string,
): Promise<{ exitCode: number | null; output: string }> {
	return new Promise((resolve, reject) => {
		const child = spawn('bash', [
			'scripts/db-restore.sh',
			'--to',
			uri,
			'--db',
			DATABASE,
		]);
		let output = '';
		child.stdout.on('data', (chunk: Buffer) => {
			output += chunk;
			process.stdout.write(chunk);
		});
		child.stderr.on('data', (chunk: Buffer) => {
			output += chunk;
			process.stderr.write(chunk);
		});
		child.on('error', reject);
		child.on('close', (exitCode) => resolve({ exitCode, output }));
	});
}

// Each backup's name leads with its UTC time, such as 2026-11-14T033559Z-daily.archive.gz.age.
function checkBackupAge(output: string): string[] {
	const match = output.match(
		/db-restore: restoring ((\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})(\d{2})Z\S*) into/,
	);
	if (!match) {
		return ["couldn't find the backup's name in db-restore's output"];
	}
	const [, name, date, hours, minutes, seconds] = match;
	const ageHours =
		(Date.now() - Date.parse(`${date}T${hours}:${minutes}:${seconds}Z`)) /
		(60 * 60 * 1000);
	if (ageHours > MAX_BACKUP_AGE_HOURS) {
		return [`the newest backup, ${name}, is ${Math.floor(ageHours)} hours old`];
	}
	console.log(
		`restore-test: the newest backup is ${Math.floor(ageHours)} hours old`,
	);
	return [];
}

// Checks every collection in the dump restored with no failed documents, and holds as many documents as the dump did.
// mongorestore logs each collection it reads from the dump, then how many of its documents restored and failed.
async function checkCollections(
	output: string,
	uri: string,
): Promise<string[]> {
	const escaped = DATABASE.replace(/[-.]/g, '\\$&');
	const inDump = [
		...output.matchAll(
			new RegExp(`reading metadata for \`${escaped}\\.([^\`]+)\``, 'g'),
		),
	].map(([, collection]) => collection);
	const restored = new Map(
		[
			...output.matchAll(
				new RegExp(
					`finished restoring \`${escaped}\\.([^\`]+)\` \\((\\d+) documents?, (\\d+) failures?\\)`,
					'g',
				),
			),
		].map(([, collection, documents, failures]) => [
			collection,
			{ documents: Number(documents), failures: Number(failures) },
		]),
	);
	if (inDump.length === 0) {
		return ['the backup held no collections'];
	}

	const problems: string[] = [];
	const client = await MongoClient.connect(uri);
	try {
		const database = client.db(DATABASE);
		for (const collection of inDump) {
			const result = restored.get(collection);
			if (!result) {
				problems.push(`${collection} didn't restore`);
				continue;
			}
			if (result.failures > 0) {
				problems.push(
					`${collection}: ${result.failures} documents failed to restore`,
				);
			}
			const inDumpCount = result.documents + result.failures;
			const count = await database.collection(collection).countDocuments();
			if (count !== inDumpCount) {
				problems.push(
					`${collection} holds ${count} documents, but the backup held ${inDumpCount}`,
				);
			} else {
				console.log(`restore-test: ${collection}: ${count} documents`);
			}
		}
	} finally {
		await client.close();
	}
	return problems;
}

function notify(message: string) {
	// The message goes in as an argument, so no quote in it can break the script.
	spawnSync('osascript', [
		'-e',
		'on run argv',
		'-e',
		'display notification (item 1 of argv) with title "Meal Planning backups"',
		'-e',
		'end run',
		message,
	]);
}
