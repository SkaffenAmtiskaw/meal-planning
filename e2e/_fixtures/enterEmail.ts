import type { Page } from '@playwright/test';

// Fills the sign-in page's email step and continues, leaving the page on whichever step comes next.
export const enterEmail = async (page: Page, email: string) => {
	await page.getByRole('textbox', { name: 'Email' }).fill(email);
	await page.getByRole('button', { name: 'Continue' }).click();
};
