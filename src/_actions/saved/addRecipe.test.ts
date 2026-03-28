import { afterEach, describe, expect, test, vi } from 'vitest';

import { zRecipeFormSchema } from '@/_models/planner/recipe';

import { addRecipe } from './addRecipe';

vi.mock('@/_models/planner/recipe', () => ({
	zRecipeFormSchema: { parse: vi.fn() },
}));

describe('add recipe', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	const buildFormData = (fields: Record<string, string>) => {
		const formData = new FormData();
		for (const [key, value] of Object.entries(fields)) {
			formData.append(key, value);
		}
		return formData;
	};

	const validFields = {
		plannerId: 'planner-123',
		name: "Ursula's Sea Witch Stew",
		ingredients: 'tentacle, seaweed, black ink',
		instructions: 'Boil, stir, and cackle',
	};

	test('parses form data with the recipe schema', async () => {
		const mockRecipe = { ...validFields };
		vi.mocked(zRecipeFormSchema.parse).mockReturnValue(mockRecipe as never);

		await addRecipe(buildFormData(validFields));

		expect(zRecipeFormSchema.parse).toHaveBeenCalledWith(
			expect.objectContaining({ name: "Ursula's Sea Witch Stew" }),
		);
	});

	test('throws when form data fails schema validation', async () => {
		vi.mocked(zRecipeFormSchema.parse).mockImplementation(() => {
			throw new Error('Validation failed');
		});

		await expect(addRecipe(buildFormData({}))).rejects.toThrow(
			'Validation failed',
		);
	});

	// --- Planned work (not yet implemented) ---

	test.skip('saves the validated recipe to the planner in the database', async () => {
		// TODO: assert that the recipe document is created and linked to the planner
	});

	test.skip('returns the newly created recipe on success', async () => {
		// TODO: assert the action returns the persisted recipe (id + fields)
	});

	test.skip("throws when the planner does not exist or the user doesn't have access", async () => {
		// TODO: assert auth/ownership is checked before writing
	});
});
