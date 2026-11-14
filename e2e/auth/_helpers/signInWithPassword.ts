import { enterEmail } from './enterEmail';

import type { Page } from '../../_fixtures';

// Signs in through the sign-in page's form, from the email step to submitting the password.
export const signInWithPassword = async (
	page: Page,
	email: string,
	password: string,
) => {
	await enterEmail(page, email);
	await page.getByLabel('Password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Sign In' }).click();
};
