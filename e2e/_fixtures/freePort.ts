import { createServer } from 'node:net';

// A port the OS has free right now, so two checkouts can run E2E at once.
export const freePort = () =>
	new Promise<string>((resolve, reject) => {
		const server = createServer();
		server.on('error', reject);
		server.listen(0, () => {
			const address = server.address();
			const port = typeof address === 'object' && address ? address.port : 0;
			server.close(() => resolve(String(port)));
		});
	});
