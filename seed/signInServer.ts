import { createServer, type ServerResponse } from 'node:http';

import { parseCookies } from 'better-auth/cookies';

import { auth, connectAuth } from '#auth';
import { env } from '@/env';

import { SEEDED_USERS } from './users';

const PORT = 3001;
const ORIGIN = `http://localhost:${PORT}`;

const linkFor = (key: string) => `${ORIGIN}/${key}`;

const sendPage = (
	response: ServerResponse,
	status: number,
	title: string,
	body: string,
) => {
	response.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
	response.end(
		`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${body}</body></html>`,
	);
};

const userList = `<table>
<tr><th>Access level</th><th>Name</th><th>Email</th><th>Link</th></tr>
${SEEDED_USERS.map(
	({ key, name, email, accessLevel }) =>
		`<tr><td>${accessLevel}</td><td>${name}</td><td>${email}</td><td><a href="/${key}">${linkFor(key)}</a></td></tr>`,
).join('\n')}
</table>`;

const keyList = SEEDED_USERS.map(({ key }) => `<code>${key}</code>`).join(', ');

const server = createServer(async (request, response) => {
	const key = new URL(request.url ?? '/', ORIGIN).pathname.slice(1);

	if (key === '') {
		sendPage(response, 200, 'Seeded users', userList);
		return;
	}

	const seeded = SEEDED_USERS.find((user) => user.key === key);
	if (!seeded) {
		sendPage(
			response,
			404,
			'No such seeded user',
			`<p>No seeded user has the key <code>${key}</code>. The keys are ${keyList}.</p><p><a href="/">All seeded users</a></p>`,
		);
		return;
	}

	const { internalAdapter, test, authCookies } = await auth.$context;
	const found = await internalAdapter.findUserByEmail(seeded.email);
	if (!found) {
		sendPage(
			response,
			404,
			`${seeded.name} isn't seeded`,
			`<p>${seeded.email} isn't in the database. Run <code>pnpm seed</code>, then open this link again.</p>`,
		);
		return;
	}

	const [session] = await test.getCookies({ userId: found.user.id });

	// No Domain, so the cookie belongs to localhost and reaches the dev server on its own port.
	const sessionCookie = [
		`${session.name}=${session.value}`,
		`Path=${session.path}`,
		session.expires &&
			`Expires=${new Date(session.expires * 1000).toUTCString()}`,
		session.httpOnly && 'HttpOnly',
		session.secure && 'Secure',
		session.sameSite && `SameSite=${session.sameSite}`,
	]
		.filter(Boolean)
		.join('; ');

	// better-auth trusts its cached session without checking it against the session cookie, so a
	// browser signed in as someone else would stay that user unless the cache goes too. Large values
	// are split into chunks named `<name>.<n>`.
	const cached = [
		authCookies.sessionData,
		authCookies.accountData,
		authCookies.dontRememberToken,
	];
	const expiredCookies = [
		...parseCookies(request.headers.cookie ?? '').keys(),
	].flatMap((sent) => {
		const match = cached.find(
			({ name }) => sent === name || sent.startsWith(`${name}.`),
		);
		return match ? [`${sent}=; Path=${match.attributes.path}; Max-Age=0`] : [];
	});

	response.writeHead(302, {
		Location: env.BETTER_AUTH_URL,
		'Set-Cookie': [sessionCookie, ...expiredCookies],
	});
	response.end();
});

await connectAuth();

server.listen(PORT, () => {
	const keyWidth = Math.max(...SEEDED_USERS.map(({ key }) => key.length));
	const linkWidth = linkFor('').length + keyWidth;
	console.log(`Sign-in links at ${ORIGIN}:`);
	for (const { key, name } of SEEDED_USERS) {
		console.log(
			`  ${key.padEnd(keyWidth)}  ${linkFor(key).padEnd(linkWidth)}  ${name}`,
		);
	}
});
