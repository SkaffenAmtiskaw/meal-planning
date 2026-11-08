// Decides whether a failed Vercel deployment starts the vercel-deploy-errors
// routine, and gathers what its session reads, for the vercel-deploy-errors
// workflow. Prints JSON with three parts: `fire`, whether to start the routine;
// `reason`, why it stays quiet, or an empty string when it fires; and `text`,
// the routine's text, or an empty string when it stays quiet. The text's exact
// shape is in step 1 of the vercel-deploy-errors skill, which reads it, so a
// change to it changes this script and the skill together.
// It uses Node's built-in modules only, so it needs no `pnpm install`.
// It reads the failure from env:
// - ENVIRONMENT: `production` or `preview`
// - BRANCH and SHA: the deployment's branch and commit
// - VERCEL_PROJECT: the project's ID or name
// - VERCEL_TOKEN: a project-scoped Vercel access token
// - GITHUB_TOKEN and GITHUB_REPOSITORY (`owner/name`): for the open PR and the
//   commit's `build` check
// Usage: pnpm -s vercel:check
// (-s hides pnpm's script banner, which would come before the JSON on stdout)

type Result = { fire: boolean; reason: string; text: string };

type VercelDeployment = {
	uid: string;
	inspectorUrl?: string | null;
	target?: string | null;
};

// A build log event carries its text either at the top level or in `payload`,
// depending on its kind.
type VercelEvent = {
	type?: string;
	level?: string;
	text?: string;
	payload?: { text?: string };
};

type CheckRun = {
	id: number;
	status: string;
	conclusion: string | null;
};

// /fire takes a text of up to 65,536 characters. The budget leaves room for
// the lines that are never trimmed.
const TEXT_LIMIT = 65_536;
const LINE_LIMIT = 2_000;
const TAIL_LINES = 100;
const CHECK_POLL_MS = 30_000;
const CHECK_WAIT_MS = 20 * 60_000;

const fail = (message: string): never => {
	console.error(`vercel:check: ${message}`);
	process.exit(1);
};

const required = (name: string): string =>
	process.env[name] || fail(`${name} isn't set`);

const environment = required('ENVIRONMENT');
const branch = required('BRANCH');
const sha = required('SHA');
const project = required('VERCEL_PROJECT');
const repository = required('GITHUB_REPOSITORY');
const githubToken = required('GITHUB_TOKEN');
// Empty when the secret is missing; Vercel's refusal then goes in the text.
const vercelToken = process.env.VERCEL_TOKEN ?? '';

if (environment !== 'production' && environment !== 'preview') {
	fail(`ENVIRONMENT is ${environment}, not production or preview`);
}

const print = (result: Result): void => {
	console.log(JSON.stringify(result, null, 2));
};

const quiet = (reason: string): never => {
	print({ fire: false, reason, text: '' });
	return process.exit(0);
};

// A GitHub call that fails stops the script, since without the answer it
// can't tell whether ci-failure already has the commit.
const github = async <T>(path: string): Promise<T> => {
	const response = await fetch(`https://api.github.com${path}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${githubToken}`,
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});
	if (!response.ok) {
		return fail(
			`GitHub API error ${response.status} on ${path}: ${await response.text()}`,
		);
	}
	return (await response.json()) as T;
};

// A Vercel call that fails is reported in the text rather than stopping the
// script, so the session can say to renew the token.
class VercelError extends Error {}

const vercel = async <T>(path: string): Promise<T> => {
	const response = await fetch(`https://api.vercel.com${path}`, {
		headers: { Authorization: `Bearer ${vercelToken}` },
	});
	if (!response.ok) {
		const body = await response.text();
		let message = body;
		try {
			message =
				(JSON.parse(body) as { error?: { message?: string } }).error?.message ??
				body;
		} catch {}
		throw new VercelError(`${response.status} ${message}`.trim());
	}
	return (await response.json()) as T;
};

const hasOpenPr = async (): Promise<boolean> => {
	const owner = repository.split('/')[0];
	const head = encodeURIComponent(`${owner}:${branch}`);
	const pulls = await github<unknown[]>(
		`/repos/${repository}/pulls?state=open&head=${head}&per_page=1`,
	);
	return pulls.length > 0;
};

// The newest `build` check run on the commit, once it has finished, or
// undefined if none finished within the wait.
const finishedBuildCheck = async (): Promise<CheckRun | undefined> => {
	const deadline = Date.now() + CHECK_WAIT_MS;
	for (;;) {
		const { check_runs } = await github<{ check_runs: CheckRun[] }>(
			`/repos/${repository}/commits/${sha}/check-runs?check_name=build&filter=latest`,
		);
		const newest = check_runs.sort((a, b) => b.id - a.id)[0];
		if (newest?.status === 'completed') {
			return newest;
		}
		if (Date.now() + CHECK_POLL_MS > deadline) {
			console.error(
				newest
					? `vercel:check: the build check is still ${newest.status} after 20 minutes`
					: 'vercel:check: no build check showed up within 20 minutes',
			);
			return undefined;
		}
		await new Promise((resolve) => setTimeout(resolve, CHECK_POLL_MS));
	}
};

const shortLine = (line: string): string =>
	line.length > LINE_LIMIT ? `${line.slice(0, LINE_LIMIT)} [trimmed]` : line;

const eventLines = (event: VercelEvent): string[] =>
	(event.text ?? event.payload?.text ?? '')
		.split('\n')
		.map((line) => line.trimEnd())
		.filter((line) => line !== '')
		.map(shortLine);

const isError = (event: VercelEvent): boolean =>
	event.type === 'stderr' || event.type === 'fatal' || event.level === 'error';

// Drops the oldest lines of the excerpt until the whole text fits, keeping the
// tail's last lines, which are closest to the failure.
const fitText = (head: string[], errors: string[], tail: string[]): string => {
	const build = () =>
		[...head, 'Build log errors:', ...errors, 'Build log tail:', ...tail].join(
			'\n',
		);
	let text = build();
	while (text.length > TEXT_LIMIT && (errors.length > 0 || tail.length > 0)) {
		if (errors.length >= tail.length) {
			errors.shift();
		} else {
			tail.shift();
		}
		text = build();
	}
	return text;
};

const vercelStatus = async (): Promise<string[]> => {
	const base = 'https://www.vercel-status.com/api/v2';
	try {
		const [status, unresolved] = await Promise.all(
			['status.json', 'incidents/unresolved.json'].map(async (path) => {
				const response = await fetch(`${base}/${path}`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status} on ${path}`);
				}
				return response.json();
			}),
		);
		const incidents = (unresolved as { incidents: { name: string }[] })
			.incidents;
		return [
			`Vercel status: ${(status as { status: { description: string } }).status.description}`,
			`Unresolved incidents: ${incidents.length > 0 ? incidents.map(({ name }) => name).join(' | ') : 'none'}`,
		];
	} catch (error) {
		return [`Vercel status: unavailable (${(error as Error).message})`];
	}
};

if (branch.startsWith('claude/')) {
	quiet(`${branch} is a routine's own claude/ branch`);
}

if (environment === 'preview') {
	const openPr = await hasOpenPr();
	if (branch !== 'develop' && !openPr) {
		quiet(`${branch} has no open PR from this repo`);
	}
	if (openPr) {
		const check = await finishedBuildCheck();
		if (
			check?.conclusion === 'failure' ||
			check?.conclusion === 'cancelled' ||
			check?.conclusion === 'timed_out'
		) {
			quiet(
				`the commit's build check ended ${check.conclusion}, so ci-failure has it`,
			);
		}
	}
}

const status = await vercelStatus();
let deployment: VercelDeployment | undefined;
let logParts: { errors: string[]; tail: string[] } | string;
try {
	const query = new URLSearchParams({
		projectId: project,
		sha,
		state: 'ERROR',
		limit: '100',
	});
	const { deployments } = await vercel<{ deployments: VercelDeployment[] }>(
		`/v7/deployments?${query}`,
	);
	// Vercel marks a production deployment's target `production` and leaves a
	// preview's empty.
	const failed = deployments.filter(
		({ target }) =>
			(target === 'production') === (environment === 'production'),
	);
	if (failed.length > 1) {
		quiet(
			`${sha} already failed ${failed.length - 1} earlier ${environment} deployment(s), and only the first fires`,
		);
	}
	deployment = failed[0];
	if (!deployment) {
		throw new VercelError(
			`404 no failed ${environment} deployment of ${sha} in project ${project}`,
		);
	}
	const events = await vercel<VercelEvent[]>(
		`/v3/deployments/${deployment.uid}/events?direction=forward&limit=-1`,
	);
	const logged = (events ?? []).filter(Boolean);
	logParts = {
		errors: logged.filter(isError).flatMap(eventLines),
		tail: logged.flatMap(eventLines).slice(-TAIL_LINES),
	};
} catch (error) {
	if (!(error instanceof VercelError)) {
		throw error;
	}
	logParts = `Build log: Vercel API error ${error.message}`;
}

const identifiers = `${environment} deployment ${deployment?.uid ?? 'unknown'} ${deployment?.inspectorUrl ?? 'unknown'}, branch ${branch}, commit ${sha}`;
const text =
	typeof logParts === 'string'
		? [identifiers, ...status, shortLine(logParts)].join('\n')
		: fitText([identifiers, ...status], logParts.errors, logParts.tail);

print({ fire: true, reason: '', text });

// Makes the file a module, which top-level await needs, since it imports
// nothing.
export {};
