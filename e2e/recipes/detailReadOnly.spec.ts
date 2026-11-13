import { expect, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import {
	notesEditButtonTestId,
	tagsEditButtonTestId,
} from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

test("read-only member sees no edit or delete controls on a recipe's page", async ({
	context,
	page,
}) => {
	// Expected to fail until "Recipe Detail Read-Only Controls" is fixed.
	test.fail();
	const { tags, recipe } = recipesSeed();
	await openRecipeDetail(page, context, recipe, {
		accessLevel: 'read',
		tags,
		saved: [recipe],
	});

	// The title first, so a page that failed to load doesn't pass as having no controls.
	await expect(page.getByRole('heading', { name: recipe.name })).toBeVisible();

	await expect(page.getByRole('button', { name: 'Edit' })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
	for (const testId of [tagsEditButtonTestId, notesEditButtonTestId]) {
		await expect(page.getByTestId(testId)).toHaveCount(0);
	}
});
