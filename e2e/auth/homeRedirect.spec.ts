import { expect, test } from '../_fixtures';

test('signed-out visitor sees the sign-in prompt', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
});
