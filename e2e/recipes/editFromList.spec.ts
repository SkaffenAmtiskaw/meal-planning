import {
	expect,
	fillBookmarkForm,
	fillRecipeForm,
	saveBookmarkForm,
	saveRecipeForm,
	test,
} from '../_fixtures';
import { openPlannerRecipes } from './_helpers/openPlannerRecipes';
import { editButtonTestId } from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

// Each planner holds one item, since recipe and bookmark rows share the edit button's test ID.

test('saves changes to a recipe from its edit button', async ({
	context,
	page,
}) => {
	const { tags, recipe } = recipesSeed();
	const name = "Tiana's Gumbo";
	await openPlannerRecipes(page, context, { tags, saved: [recipe] });

	await page.getByTestId(editButtonTestId).click();
	const dialog = page.getByRole('dialog');
	await fillRecipeForm(dialog, { name });
	await saveRecipeForm(dialog);

	await expect(page.getByRole('link', { name })).toBeVisible();
	await expect(page.getByRole('link', { name: recipe.name })).toHaveCount(0);
});

test('saves changes to a bookmark from its edit button', async ({
	context,
	page,
}) => {
	const { tags, bookmark } = recipesSeed();
	const name = "Linguini's Ratatouille";
	const url = 'https://example.com/linguini-ratatouille';
	await openPlannerRecipes(page, context, { tags, saved: [bookmark] });

	await page.getByTestId(editButtonTestId).click();
	const dialog = page.getByRole('dialog');
	await fillBookmarkForm(dialog, { name, url });
	await saveBookmarkForm(dialog);

	await expect(page.getByRole('link', { name })).toHaveAttribute('href', url);
	await expect(page.getByRole('link', { name: bookmark.name })).toHaveCount(0);
});
