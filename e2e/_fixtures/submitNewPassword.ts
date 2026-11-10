import type { Page } from '@playwright/test';

// Fills in and submits the reset password page's form.
export const submitNewPassword = async (page: Page, password: string) => {
	await page.getByLabel('New password', { exact: true }).fill(password);
	await page.getByLabel('Confirm new password', { exact: true }).fill(password);
	await page.getByRole('button', { name: 'Reset password' }).click();
};
