import type { Locator } from '@playwright/test';

// Clicks the delete trigger, then Delete in the confirm dialog it opens.
// It doesn't wait for the dialog to close, since a failed delete keeps it open.
export const confirmDelete = async (trigger: Locator) => {
	await trigger.click();
	await trigger
		.page()
		.getByRole('dialog')
		.getByRole('button', { name: 'Delete', exact: true })
		.click();
};
