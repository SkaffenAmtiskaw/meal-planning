import { expect, test } from '../_fixtures';
import { openPlannerRecipes } from './_helpers/openPlannerRecipes';
import { recipePath } from './_helpers/recipesPaths';
import { recipesSeed } from './_helpers/recipesSeed';

test("lists the planner's recipes and bookmarks with their tags", async ({
	context,
	page,
}) => {
	const { tags, recipe, bookmark } = recipesSeed();
	await openPlannerRecipes(page, context, {
		tags,
		saved: [recipe, bookmark],
	});

	await expect(page.getByRole('link', { name: recipe.name })).toBeVisible();
	await expect(page.getByRole('link', { name: bookmark.name })).toBeVisible();
	for (const tag of tags) {
		await expect(page.getByText(tag.name, { exact: true })).toBeVisible();
	}
});

test('links a recipe to its page and a bookmark to its URL', async ({
	context,
	page,
}) => {
	const { tags, recipe, bookmark } = recipesSeed();
	const planner = await openPlannerRecipes(page, context, {
		tags,
		saved: [recipe, bookmark],
	});

	await expect(page.getByRole('link', { name: recipe.name })).toHaveAttribute(
		'href',
		recipePath(planner._id, recipe._id),
	);
	await expect(page.getByRole('link', { name: bookmark.name })).toHaveAttribute(
		'href',
		bookmark.url,
	);
});
