import { confirmDelete, expect, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import { recipesSeed } from './_helpers/recipesSeed';

test('deletes a recipe from its page', async ({ context, page }) => {
	const { tags, recipe, bookmark } = recipesSeed();
	const planner = await openRecipeDetail(page, context, recipe, {
		tags,
		saved: [recipe, bookmark],
	});

	await confirmDelete(
		page,
		page.getByRole('button', { name: 'Delete', exact: true }),
	);

	// The page redirects whether or not the delete worked, so the list is what shows the recipe is gone.
	await expect(page).toHaveURL(`/${planner._id}/recipes`);
	await expect(page.getByRole('link', { name: bookmark.name })).toBeVisible();
	await expect(page.getByRole('link', { name: recipe.name })).toHaveCount(0);
});
