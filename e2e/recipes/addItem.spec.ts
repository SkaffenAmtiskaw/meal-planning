import {
	expect,
	fillBookmarkForm,
	fillRecipeForm,
	saveBookmarkForm,
	saveRecipeForm,
	test,
} from '../_fixtures';
import { openPlannerRecipes } from './_helpers/openPlannerRecipes';

test('adds a recipe from the Add Item dropdown', async ({ context, page }) => {
	// Expected to fail until "Empty Source URL Blocks Saving a Recipe" is fixed.
	test.fail();
	const name = "Mulan's Congee";
	await openPlannerRecipes(page, context);

	await page.getByRole('button', { name: 'Add Item' }).click();
	await page.getByRole('menuitem', { name: 'Recipe' }).click();
	const dialog = page.getByRole('dialog');
	await fillRecipeForm(dialog, { name, ingredients: ['1 cup jasmine rice'] });
	await saveRecipeForm(dialog);

	await expect(page.getByRole('link', { name })).toBeVisible();
});

test('adds a bookmark from the Add Item dropdown', async ({
	context,
	page,
}) => {
	const name = "Remy's Soup";
	const url = 'https://example.com/remys-soup';
	await openPlannerRecipes(page, context);

	await page.getByRole('button', { name: 'Add Item' }).click();
	await page.getByRole('menuitem', { name: 'Bookmark' }).click();
	const dialog = page.getByRole('dialog');
	await fillBookmarkForm(dialog, { name, url });
	await saveBookmarkForm(dialog);

	await expect(page.getByRole('link', { name })).toHaveAttribute('href', url);
});
