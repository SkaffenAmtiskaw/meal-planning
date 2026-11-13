import { confirmDelete, expect, test } from '../_fixtures';
import { openPlannerRecipes } from './_helpers/openPlannerRecipes';
import {
	deleteBookmarkButtonTestId,
	deleteRecipeButtonTestId,
} from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

// Each planner holds a recipe and a bookmark, so each test can see the other item stays.

test('deletes a recipe from the list', async ({ context, page }) => {
	const { tags, recipe, bookmark } = recipesSeed();
	await openPlannerRecipes(page, context, { tags, saved: [recipe, bookmark] });

	await confirmDelete(page.getByTestId(deleteRecipeButtonTestId));

	await expect(page.getByRole('link', { name: recipe.name })).toHaveCount(0);
	await expect(page.getByRole('link', { name: bookmark.name })).toBeVisible();
});

test('deletes a bookmark from the list', async ({ context, page }) => {
	const { tags, recipe, bookmark } = recipesSeed();
	await openPlannerRecipes(page, context, { tags, saved: [recipe, bookmark] });

	await confirmDelete(page.getByTestId(deleteBookmarkButtonTestId));

	await expect(page.getByRole('link', { name: bookmark.name })).toHaveCount(0);
	await expect(page.getByRole('link', { name: recipe.name })).toBeVisible();
});
