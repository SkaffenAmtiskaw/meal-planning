import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

type SentEmail = { to: string | string[] };

// Every email the app has sent, by recipient, oldest first.
const inboxes = new Map<string, SentEmail[]>();

const server = createServer(async (request, response) => {
	const url = new URL(request.url ?? '/', 'http://localhost');

	// Resend's send endpoint, which the app's Resend client calls.
	if (request.method === 'POST' && url.pathname === '/emails') {
		let body = '';
		for await (const chunk of request) body += chunk;
		const email: SentEmail = JSON.parse(body);
		for (const recipient of [email.to].flat()) {
			inboxes.set(recipient, [...(inboxes.get(recipient) ?? []), email]);
		}
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify({ id: randomUUID() }));
		return;
	}

	// The fake's own route, which the tests call to read what was sent.
	if (request.method === 'GET' && url.pathname === '/emails') {
		const recipient = url.searchParams.get('to') ?? '';
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(JSON.stringify(inboxes.get(recipient) ?? []));
		return;
	}

	response.writeHead(404).end();
});

server.listen(0, () => {
	const { port } = server.address() as AddressInfo;
	console.log(`Fake Resend ready at http://localhost:${port}`);
});
