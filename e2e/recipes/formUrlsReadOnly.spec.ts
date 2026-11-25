import { expect, test } from '../_fixtures';
import { recipePath, recipesListPath } from '../_helpers/plannerPaths';
import { signInToNewPlanner } from '../_helpers/signInToNewPlanner';
import { recipesSeed } from './_helpers/recipesSeed';

test("read-only member who opens a recipe's edit URL lands on its page with no form", async ({
	context,
	page,
}) => {
	const { tags, recipe } = recipesSeed();
	const { planner } = await signInToNewPlanner(context, {
		accessLevel: 'read',
		tags,
		saved: [recipe],
	});
	const path = recipePath(planner._id, recipe._id);

	await page.goto(`${path}?status=edit`);

	await expect(page).toHaveURL(path);
	// The title first, so a page that failed to load doesn't pass as having no form.
	await expect(page.getByRole('heading', { name: recipe.name })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(0);
});

test("read-only member who opens the list's add or edit URLs lands on the plain list", async ({
	context,
	page,
}) => {
	const { tags, recipe, bookmark } = recipesSeed();
	const { planner } = await signInToNewPlanner(context, {
		accessLevel: 'read',
		tags,
		saved: [recipe, bookmark],
	});
	const path = recipesListPath(planner._id);

	for (const search of [
		'?status=add&type=recipe',
		'?status=add&type=bookmark',
		`?status=edit&type=recipe&item=${recipe._id}`,
		`?status=edit&type=bookmark&item=${bookmark._id}`,
	]) {
		await page.goto(`${path}${search}`);

		await expect(page).toHaveURL(path);
		// The items first, so a page that failed to load doesn't pass as having no modal.
		await expect(page.getByRole('link', { name: recipe.name })).toBeVisible();
		await expect(page.getByRole('dialog')).toHaveCount(0);
	}
});
