import type { BrowserContext } from '@playwright/test';

import { auth } from '#auth';

// Signs the user in without the form by adding a fresh session cookie to the context.
export const signIn = async (context: BrowserContext, user: { id: string }) => {
	const cookies = await (await auth.$context).test.getCookies({
		userId: user.id,
	});
	await context.addCookies(cookies);
};
