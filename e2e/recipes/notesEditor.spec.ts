import { expect, test } from '../_fixtures';
import { openRecipeDetail } from './_helpers/openRecipeDetail';
import { notesEditButtonTestId } from './_helpers/recipesLabels';
import { recipesSeed } from './_helpers/recipesSeed';

test('saves notes changed with the notes editor', async ({ context, page }) => {
	const { tags, recipe } = recipesSeed();
	await openRecipeDetail(page, context, recipe, { tags });
	const newNotes = 'Serve with whipped cream';

	await page.getByTestId(notesEditButtonTestId).click();
	// The textarea and save button have no accessible name.
	await page.getByTestId('notes-textarea').fill(newNotes);
	await page.getByTestId('notes-save-button').click();
	await expect(page.getByTestId(notesEditButtonTestId)).toBeVisible();

	// Reloading shows the notes were saved, not only kept in the editor's state.
	await page.reload();
	await expect(page.getByTestId('notes')).toHaveText(newNotes);
});
