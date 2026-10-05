// Lists the security advisories that aren't in the reported list, for the
// dependency-updates workflow. Prints JSON with two parts: `new`, the findings
// the list doesn't have, and `reported`, the updated list of every current
// advisory ID, so a fixed one drops out. With no list, every finding is new.
// It only reports: it never changes package.json or the lockfile.
// `pnpm audit` reads only the lockfile, so this needs no `pnpm install`.
// Usage: pnpm -s deps:check [--reported <path to a JSON array of identifiers>]
// (-s hides pnpm's script banner, which would come before the JSON on stdout)

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

type Finding = {
	kind: 'advisory';
	id: string;
	severity: string;
	package: string;
};

type AuditAdvisory = {
	id: number;
	severity: string;
	module_name: string;
};

const fail = (message: string): never => {
	console.error(`deps:check: ${message}`);
	process.exit(1);
};

const readReported = (path: string): string[] => {
	if (!existsSync(path)) {
		return fail(`the reported list ${path} doesn't exist`);
	}
	let list: unknown;
	try {
		list = JSON.parse(readFileSync(path, 'utf8'));
	} catch {
		return fail(`the reported list ${path} isn't valid JSON`);
	}
	if (!Array.isArray(list) || !list.every((id) => typeof id === 'string')) {
		return fail(`the reported list ${path} isn't a JSON array of strings`);
	}
	return list;
};

// `pnpm audit` exits non-zero when it finds advisories, so the exit code alone
// can't tell findings from a failure. A failure prints `{ "error": ... }`
// instead of `advisories`.
const runAudit = (): Finding[] => {
	const result = spawnSync('pnpm', ['audit', '--json'], {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	if (result.error) {
		return fail(`pnpm audit couldn't run: ${result.error.message}`);
	}
	let output: { advisories?: Record<string, AuditAdvisory>; error?: unknown };
	try {
		output = JSON.parse(result.stdout);
	} catch {
		return fail(`pnpm audit printed no JSON (exit ${result.status})`);
	}
	if (output.error || !output.advisories) {
		return fail(`pnpm audit failed: ${JSON.stringify(output.error ?? output)}`);
	}
	return Object.values(output.advisories).map((advisory) => ({
		kind: 'advisory',
		id: String(advisory.id),
		severity: advisory.severity,
		package: advisory.module_name,
	}));
};

const { values } = parseArgs({ options: { reported: { type: 'string' } } });
const reported = new Set(values.reported ? readReported(values.reported) : []);
const findings = runAudit();

console.log(
	JSON.stringify(
		{
			new: findings.filter((finding) => !reported.has(finding.id)),
			reported: findings.map((finding) => finding.id),
		},
		null,
		2,
	),
);
