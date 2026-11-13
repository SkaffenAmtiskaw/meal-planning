import { expect, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import { tagsEditButtonTestId } from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

test('saves a tag added with the tags editor', async ({ context, page }) => {
	// The recipe has the first tag, and the planner has both.
	const { tags, recipe } = recipesSeed();
	await openRecipeDetail(page, context, recipe, { tags, saved: [recipe] });

	await page.getByTestId(tagsEditButtonTestId).click();
	await page.getByPlaceholder('Search or create tags').click();
	await page.getByRole('option', { name: tags[1].name }).click();
	// The save button has no accessible name.
	await page.getByTestId('tags-save-button').click();
	await expect(page.getByTestId(tagsEditButtonTestId)).toBeVisible();

	// Reloading shows the tags were saved, not only kept in the editor's state.
	await page.reload();
	const shownTags = page.getByTestId('tags');
	await expect(shownTags.getByText(tags[0].name)).toBeVisible();
	await expect(shownTags.getByText(tags[1].name)).toBeVisible();
});
