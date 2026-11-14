import { enterEmail } from './enterEmail';

import { expect, type Page } from '../../_fixtures';

// Asks for a reset password email from the sign-in page, and waits for "Check your inbox" naming the email.
export const requestPasswordReset = async (page: Page, email: string) => {
	await page.goto('/');
	await enterEmail(page, email);
	await page.getByRole('button', { name: 'Forgot password?' }).click();
	await expect(page.getByText('Check your inbox')).toContainText(email);
};
