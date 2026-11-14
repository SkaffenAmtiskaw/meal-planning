import { test as base } from '@playwright/test';

export const test = base.extend({
	// Gives each test its own client IP. better-auth rate-limits by IP in a production build, so tests sharing
	// one would run into its limits, such as three sign-ups in 10 seconds.
	extraHTTPHeaders: async ({ extraHTTPHeaders }, use) => {
		const octet = () => Math.floor(Math.random() * 254) + 1;
		await use({
			...extraHTTPHeaders,
			'X-Forwarded-For': `10.${octet()}.${octet()}.${octet()}`,
		});
	},
});
