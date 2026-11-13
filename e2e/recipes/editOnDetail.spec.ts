import { expect, fillRecipeForm, saveRecipeForm, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import { recipePath } from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

test('saves changes made with Edit', async ({ context, page }) => {
	const { tags, recipe } = recipesSeed();
	const name = "Tiana's Gumbo";
	const servings = 8;
	const planner = await openRecipeDetail(page, context, recipe, {
		tags,
		saved: [recipe],
	});

	await page.getByRole('button', { name: 'Edit', exact: true }).click();
	// The Edit form renders in the page, not in a dialog.
	await fillRecipeForm(page, { name, servings });
	await saveRecipeForm(page);

	await expect(page).toHaveURL(recipePath(planner._id, recipe._id));
	await expect(page.getByRole('heading', { name })).toBeVisible();
	await expect(page.getByText(String(servings), { exact: true })).toBeVisible();
});
