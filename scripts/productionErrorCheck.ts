// Decides which PostHog error issues start the production-errors routine, and
// builds each one's text, for the production-errors workflow. Prints JSON with
// two parts:
// - `chosen`: the texts to send, each with the record the workflow adds to the
//   reported list once its /fire call succeeds. `issue` is the issue's ID, or
//   null for the text that says PostHog refused the key.
// - `reported`: the updated list, without the chosen issues, so an issue goes
//   into it only after its call succeeds.
// The text's exact shape is in step 1 of the production-errors skill, which
// reads it, so a change to it changes this script and the skill together.
// It uses Node's built-in modules only, so it needs no `pnpm install`.
// It reads from env:
// - POSTHOG_READ_KEY: a personal API key with only `error_tracking:read`
// - POSTHOG_PROJECT_ID: the project's ID
// Usage: pnpm -s errors:check [--reported <path to the reported list>]
// (-s hides pnpm's script banner, which would come before the JSON on stdout)

import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

// The list keeps every issue's last known status, so an issue that drops out
// of the query's date range keeps the status it had. `issues` is missing when
// a run had no list and PostHog refused the key, so the next run still treats
// the list as missing rather than every issue as new.
type Reported = {
	issues?: Record<string, string>;
	refusalReported: boolean;
};

type Chosen = { issue: string | null; status: string; text: string };

type Issue = {
	id: string;
	name?: string | null;
	description?: string | null;
	status?: string;
	first_seen?: string | null;
	last_seen?: string | null;
	library?: string | null;
	aggregations?: { occurrences?: number } | null;
};

type Frame = {
	resolved_name?: string | null;
	function?: string | null;
	mangled_name?: string | null;
	source?: string | null;
	line?: number | null;
	column?: number | null;
	in_app?: boolean;
};

type Exception = {
	type?: string;
	value?: string;
	stacktrace?: { frames?: Frame[] };
};

type IssueEvent = {
	timestamp?: string;
	properties?: {
		$current_url?: string;
		$lib?: string;
		$exception_list?: Exception[] | unknown;
		$exception_release?: {
			version?: string;
			metadata?: { git?: { commit_id?: string } };
		} | null;
	};
};

const HOST = 'https://us.posthog.com';
// /fire takes a text of up to 65,536 characters.
const TEXT_LIMIT = 65_536;
const MAX_CHOSEN = 5;
const PAGE_SIZE = 100;

const fail = (message: string): never => {
	console.error(`errors:check: ${message}`);
	process.exit(1);
};

const required = (name: string): string =>
	process.env[name] || fail(`${name} isn't set`);

const projectId = required('POSTHOG_PROJECT_ID');
// Empty when the secret is missing; PostHog's refusal then becomes the text.
const readKey = process.env.POSTHOG_READ_KEY ?? '';

const { values: args } = parseArgs({
	options: { reported: { type: 'string' } },
});

const readReported = (path: string): Reported => {
	if (!existsSync(path)) {
		return fail(`the reported list ${path} doesn't exist`);
	}
	let list: Reported;
	try {
		list = JSON.parse(readFileSync(path, 'utf8')) as Reported;
	} catch {
		return fail(`the reported list ${path} isn't valid JSON`);
	}
	if (
		typeof list !== 'object' ||
		list === null ||
		typeof list.refusalReported !== 'boolean' ||
		(list.issues !== undefined &&
			(typeof list.issues !== 'object' ||
				!Object.values(list.issues).every((s) => typeof s === 'string')))
	) {
		return fail(
			`the reported list ${path} isn't { issues?: { <id>: <status> }, refusalReported: boolean }`,
		);
	}
	return list;
};

const previous: Reported | undefined = args.reported
	? readReported(args.reported)
	: undefined;

const print = (chosen: Chosen[], reported: Reported): void => {
	console.log(JSON.stringify({ chosen, reported }, null, 2));
};

// A 401 or 403 is reported in a text rather than stopping the run, so a
// revoked key reaches the user. Any other failure stops the run, which then
// saves nothing, and the next run tries again.
class RefusedError extends Error {}

const posthog = async <T>(path: string, body: object): Promise<T> => {
	const response = await fetch(
		`${HOST}/api/projects/${projectId}/error_tracking/query/${path}/`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${readKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		},
	);
	if (response.status === 401 || response.status === 403) {
		const text = await response.text();
		let message = text;
		try {
			message = (JSON.parse(text) as { detail?: string }).detail ?? text;
		} catch {}
		throw new RefusedError(`HTTP ${response.status} ${message}`.trim());
	}
	if (!response.ok) {
		return fail(
			`PostHog API error ${response.status} on ${path}: ${await response.text()}`,
		);
	}
	return (await response.json()) as T;
};

// Every issue with an occurrence in the last 7 days, PostHog's default range,
// whatever its status.
const fetchIssues = async (): Promise<Issue[]> => {
	const issues: Issue[] = [];
	let offset = 0;
	for (;;) {
		const page = await posthog<{ results: Issue[]; nextOffset?: number }>(
			'issues',
			{
				status: 'all',
				filterTestAccounts: false,
				limit: PAGE_SIZE,
				offset,
			},
		);
		issues.push(...page.results);
		if (page.nextOffset === undefined) {
			return issues;
		}
		offset = page.nextOffset;
	}
};

const latestEvent = async (
	issueId: string,
): Promise<IssueEvent | undefined> => {
	const { results } = await posthog<{ results: IssueEvent[] }>('issue_events', {
		issueId,
		limit: 1,
		include: [
			'exception',
			'stacktrace',
			'environment',
			'navigation',
			'release',
		],
		filterTestAccounts: false,
		onlyAppFrames: false,
	});
	return results[0];
};

// Each value sits on one line of the text, so a newline in an error message
// can't pass for a line of its own.
const oneLine = (value: unknown): string => {
	if (value === undefined || value === null || value === '') {
		return 'none';
	}
	return String(value).replace(/\s*[\r\n]+\s*/g, ' ');
};

// A part PostHog didn't have is `none`, as for any other value. A function
// PostHog couldn't name comes through as its own `?`.
const frameLine = (frame: Frame): string => {
	const name = frame.resolved_name || frame.function || frame.mangled_name;
	const place = [frame.source, frame.line, frame.column]
		.map((part) => oneLine(part))
		.join(':');
	return oneLine(
		`${oneLine(name)} at ${place} (${frame.in_app ? 'in app' : 'not in app'})`,
	);
};

// Each exception's frames, the raising frame first. PostHog lists them from
// the outermost call to the frame that raised.
const exceptionLines = (event: IssueEvent | undefined): string[][] => {
	const list = event?.properties?.$exception_list;
	if (!Array.isArray(list)) {
		return [];
	}
	return (list as Exception[]).map((exception) => [
		`Exception: ${oneLine(exception.type)}: ${oneLine(exception.value)}`,
		...[...(exception.stacktrace?.frames ?? [])].reverse().map(frameLine),
	]);
};

// Drops frames from the bottom until the text fits. An exception's own line
// is never dropped.
const fitText = (head: string[], exceptions: string[][]): string => {
	const blocks = exceptions.map((lines) => [...lines]);
	let dropped = 0;
	const build = () =>
		[
			...head,
			...blocks.flat(),
			...(dropped > 0 ? [`${dropped} frames dropped to fit`] : []),
		].join('\n');
	let text = build();
	while (text.length > TEXT_LIMIT) {
		const last = blocks.findLast((lines) => lines.length > 1);
		if (!last) {
			break;
		}
		last.pop();
		dropped += 1;
		text = build();
	}
	return text.slice(0, TEXT_LIMIT);
};

const issueText = (
	kind: 'new' | 'reopened',
	issue: Issue,
	event: IssueEvent | undefined,
): string => {
	const release = event?.properties?.$exception_release;
	const head = [
		`${kind} PostHog issue ${issue.id} ${HOST}/project/${projectId}/error_tracking/${issue.id}`,
		`Name: ${oneLine(issue.name)}`,
		`Description: ${oneLine(issue.description)}`,
		`First seen: ${oneLine(issue.first_seen)}`,
		`Last seen: ${oneLine(issue.last_seen)}`,
		`Occurrences: ${oneLine(issue.aggregations?.occurrences)}`,
		`Library: ${oneLine(issue.library)}`,
		`Latest event: ${oneLine(event?.timestamp)}`,
		`URL: ${oneLine(event?.properties?.$current_url)}`,
		`$lib: ${oneLine(event?.properties?.$lib)}`,
		`Release: ${oneLine(release?.version ?? release?.metadata?.git?.commit_id)}`,
	];
	return fitText(head, exceptionLines(event));
};

let issues: Issue[];
try {
	issues = await fetchIssues();
} catch (error) {
	if (!(error instanceof RefusedError)) {
		throw error;
	}
	// One session per refusal: once its text is sent, later runs stay quiet
	// until the key works again.
	const reported: Reported = { ...previous, refusalReported: false };
	if (previous?.refusalReported) {
		print([], { ...reported, refusalReported: true });
	} else {
		print(
			[
				{
					issue: null,
					status: 'refused',
					text: `PostHog refused the read key: ${oneLine(error.message)}`,
				},
			],
			reported,
		);
	}
	process.exit(0);
}

// With no list, every current issue is recorded and none starts a session, so
// the errors already in PostHog don't each start one.
if (!previous?.issues) {
	print([], {
		issues: Object.fromEntries(
			issues.map(({ id, status }) => [id, status ?? 'unknown']),
		),
		refusalReported: false,
	});
	process.exit(0);
}

const known = previous.issues;
const candidates = issues
	.filter(
		({ id, status }) =>
			status === 'active' &&
			(known[id] === undefined || known[id] === 'resolved'),
	)
	.sort((a, b) => (a.first_seen ?? '').localeCompare(b.first_seen ?? ''));
const picked = candidates.slice(0, MAX_CHOSEN);
const candidateIds = new Set(candidates.map(({ id }) => id));

// The candidates keep their old record: a chosen one is added once its call
// succeeds, and the rest wait for the next run.
const updated: Record<string, string> = { ...known };
for (const { id, status } of issues) {
	if (!candidateIds.has(id)) {
		updated[id] = status ?? 'unknown';
	}
}

const chosen: Chosen[] = [];
for (const issue of picked) {
	let event: IssueEvent | undefined;
	try {
		event = await latestEvent(issue.id);
	} catch (error) {
		if (!(error instanceof RefusedError)) {
			throw error;
		}
		fail(
			`PostHog refused the event query after the issues query: ${error.message}`,
		);
	}
	chosen.push({
		issue: issue.id,
		status: 'active',
		text: issueText(
			known[issue.id] === 'resolved' ? 'reopened' : 'new',
			issue,
			event,
		),
	});
}

print(chosen, { issues: updated, refusalReported: false });
