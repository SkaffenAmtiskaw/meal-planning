import { expect, test } from '../_fixtures';
import { openPlannerRecipes } from './_helpers/openPlannerRecipes';
import {
	deleteBookmarkButtonTestId,
	deleteRecipeButtonTestId,
	editButtonTestId,
} from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

test('read-only member sees the list with no add, edit or delete controls', async ({
	context,
	page,
}) => {
	const { tags, recipe, bookmark } = recipesSeed();
	await openPlannerRecipes(page, context, {
		accessLevel: 'read',
		tags,
		saved: [recipe, bookmark],
	});

	// The items first, so a page that failed to load doesn't pass as having no controls.
	await expect(page.getByRole('link', { name: recipe.name })).toBeVisible();
	await expect(page.getByRole('link', { name: bookmark.name })).toBeVisible();

	await expect(page.getByRole('button', { name: 'Add Item' })).toHaveCount(0);
	for (const testId of [
		editButtonTestId,
		deleteRecipeButtonTestId,
		deleteBookmarkButtonTestId,
	]) {
		await expect(page.getByTestId(testId)).toHaveCount(0);
	}
});
