import { expect, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import { recipesSeed } from './_helpers/recipesSeed';

test("shows a recipe's details", async ({ context, page }) => {
	const { tags, recipe } = recipesSeed();
	await openRecipeDetail(page, context, recipe, { tags });

	await expect(page.getByRole('heading', { name: recipe.name })).toBeVisible();
	await expect(
		page.getByRole('link', { name: recipe.source.url }),
	).toHaveAttribute('href', recipe.source.url);
	for (const value of [
		recipe.source.name,
		recipe.time.prep,
		recipe.time.cook,
		recipe.time.total,
		recipe.time.actual,
		String(recipe.servings),
		...recipe.ingredients,
		...recipe.instructions,
		recipe.notes,
		recipe.storage,
		tags[0].name,
	]) {
		await expect(page.getByText(value, { exact: true })).toBeVisible();
	}
	// The planner's other tag isn't the recipe's, so the page doesn't show it.
	await expect(page.getByText(tags[1].name, { exact: true })).toHaveCount(0);
});
