import type { Locator, Page } from '@playwright/test';

type BookmarkFormFields = {
	name?: string;
	url?: string;
};

// Fills each given field of the Bookmark form within the scope.
export const fillBookmarkForm = async (
	scope: Page | Locator,
	{ name, url }: BookmarkFormFields,
) => {
	const textbox = (label: string) =>
		scope.getByRole('textbox', { name: label, exact: true });

	if (name !== undefined) await textbox('Name').fill(name);
	if (url !== undefined) await textbox('URL').fill(url);
};

// Submits the Bookmark form within the scope, whether it's adding a bookmark or saving one.
export const saveBookmarkForm = async (scope: Page | Locator) => {
	await scope.getByRole('button', { name: /^(Add Bookmark|Save)$/ }).click();
};
