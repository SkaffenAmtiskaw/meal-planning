// Lists the security advisories and, with --weekly, the new versions of the
// packages in package.json that aren't in the reported list, for the
// dependency-updates workflow. Prints JSON with three parts: `new`, the
// findings the list doesn't have; `reminders`, the advisories the list has that
// are still unfixed, on the weekly check only; and `reported`, the updated list
// of every current identifier, so a fixed advisory or a merged or superseded
// version drops out. With no list, every finding is new.
// It only reports: it never changes package.json or the lockfile.
// `pnpm audit` reads only the lockfile, so the hourly check needs no
// `pnpm install`. `pnpm outdated` needs one, so the weekly check does.
// Usage: pnpm -s deps:check [--weekly] [--reported <path to a JSON array of identifiers>]
// (-s hides pnpm's script banner, which would come before the JSON on stdout)

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

type Finding =
	| {
			kind: 'advisory';
			id: string;
			severity: string;
			package: string;
	  }
	| {
			kind: VersionKind;
			// `package@version`
			id: string;
			package: string;
	  };

type VersionKind = 'patch' | 'minor' | 'major';

type AuditAdvisory = {
	id: number;
	severity: string;
	module_name: string;
};

type OutdatedPackage = {
	// Missing when the package isn't installed
	current?: string;
	latest: string;
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

// `pnpm audit` and `pnpm outdated` exit non-zero when they find something, so
// the exit code alone can't tell findings from a failure. A failure prints
// something other than the JSON, such as `pnpm outdated`'s registry errors.
const runPnpm = (args: string[]): unknown => {
	const result = spawnSync('pnpm', args, {
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024,
		stdio: ['ignore', 'pipe', 'inherit'],
	});
	if (result.error) {
		return fail(`pnpm ${args[0]} couldn't run: ${result.error.message}`);
	}
	try {
		return JSON.parse(result.stdout);
	} catch {
		return fail(
			`pnpm ${args[0]} printed no JSON (exit ${result.status}):\n${result.stdout}`,
		);
	}
};

// An audit failure prints `{ "error": ... }` instead of `advisories`.
const runAudit = (): Finding[] => {
	const output = runPnpm(['audit', '--json']) as {
		advisories?: Record<string, AuditAdvisory>;
		error?: unknown;
	};
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

const parseVersion = (name: string, version: string): number[] => {
	const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
	if (!match) {
		return fail(`can't read ${name}'s version ${version}`);
	}
	return match.slice(1).map(Number);
};

// A minor of a package below 1.0 is marked major, since semver lets anything
// change in a `0.y.z` version. A `latest` that isn't newer, as for a deprecated
// package `pnpm outdated` lists, has no kind.
const versionKind = (
	current: number[],
	latest: number[],
): VersionKind | undefined => {
	const changed = latest.findIndex((part, index) => part !== current[index]);
	if (changed === -1 || latest[changed] < current[changed]) {
		return undefined;
	}
	if (changed === 0 || (changed === 1 && current[0] === 0)) {
		return 'major';
	}
	return changed === 1 ? 'minor' : 'patch';
};

const runOutdated = (): Finding[] => {
	const output = runPnpm(['outdated', '--format', 'json']) as Record<
		string,
		OutdatedPackage
	>;
	return Object.entries(output).flatMap(([name, { current, latest }]) => {
		if (!current) {
			return fail(
				`pnpm outdated has no installed version of ${name}; run pnpm install first`,
			);
		}
		const kind = versionKind(
			parseVersion(name, current),
			parseVersion(name, latest),
		);
		return kind ? [{ kind, id: `${name}@${latest}`, package: name }] : [];
	});
};

// Advisory IDs are numbers; a version is `package@version`, and a scoped
// package's name also starts with `@`.
const isVersionId = (id: string): boolean => id.lastIndexOf('@') > 0;

const { values } = parseArgs({
	options: { reported: { type: 'string' }, weekly: { type: 'boolean' } },
});
const reportedList = values.reported ? readReported(values.reported) : [];
const reported = new Set(reportedList);
const findings = [...runAudit(), ...(values.weekly ? runOutdated() : [])];
// The hourly check can't tell whether a reported version is still current, so
// it keeps them all. Otherwise the next weekly check would report them again.
const keptVersions = values.weekly ? [] : reportedList.filter(isVersionId);

console.log(
	JSON.stringify(
		{
			new: findings.filter((finding) => !reported.has(finding.id)),
			// The weekly check repeats every unfixed advisory, so one isn't
			// reported once and forgotten. Versions stay quiet once reported.
			reminders: values.weekly
				? findings.filter(
						(finding) =>
							finding.kind === 'advisory' && reported.has(finding.id),
					)
				: [],
			reported: [...findings.map((finding) => finding.id), ...keptVersions],
		},
		null,
		2,
	),
);
