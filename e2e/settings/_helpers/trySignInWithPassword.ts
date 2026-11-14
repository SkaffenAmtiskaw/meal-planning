import type { Page } from '../../_fixtures';

// Sends an email-and-password sign-in straight to better-auth, without the sign-in form, and says whether
// it was accepted. A Settings spec checks credentials with it, so a change to the sign-in page doesn't break it.
export const trySignInWithPassword = async (
	page: Page,
	email: string,
	password: string,
) => {
	const response = await page.request.post('/api/auth/sign-in/email', {
		data: { email, password },
		// better-auth rejects a request that carries a session cookie and no Origin.
		headers: { origin: new URL(page.url()).origin },
	});

	// Any other failure, such as the origin check, would pass for a rejected password.
	if (!response.ok() && response.status() !== 401) {
		throw new Error(
			`Sign-in request failed with ${response.status()}: ${await response.text()}`,
		);
	}

	return response.ok();
};
