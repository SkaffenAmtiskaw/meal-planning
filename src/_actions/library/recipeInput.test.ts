import { describe, expect, test } from 'vitest';

import { newId } from '@/_models/database/newId';

import { zRecipeInput } from './recipeInput';

const plannerId = newId();

const validInput = {
	plannerId,
	name: "Maleficent's Dark Forest Stew",
	ingredients: ['raven feathers', 'thorn berries', 'moonwater'],
	instructions: ['Gather at midnight', 'Stir counterclockwise until cursed'],
};

describe('zRecipeInput', () => {
	test('accepts a valid recipe form submission', () => {
		expect(zRecipeInput.safeParse(validInput).success).toBe(true);
	});

	test('rejects a form submission missing plannerId', () => {
		const { plannerId: _, ...rest } = validInput;
		expect(zRecipeInput.safeParse(rest).success).toBe(false);
	});

	test('accepts optional fields set to empty strings, which the form starts at', () => {
		expect(
			zRecipeInput.safeParse({
				...validInput,
				notes: '',
				storage: '',
				source: { name: '', url: '' },
				time: { prep: '', cook: '', total: '', actual: '' },
			}).success,
		).toBe(true);
	});

	test('keeps every field the form edits', () => {
		const filled = {
			...validInput,
			notes: 'Serve cold',
			servings: 4,
			source: { name: 'Dark Grimoire', url: 'https://example.com' },
			storage: 'A sealed cauldron',
			tags: [newId()],
			time: { prep: '1h', cook: '2h', total: '3h', actual: '4h' },
		};

		expect(zRecipeInput.parse(filled)).toEqual(filled);
	});

	test('drops fields the form does not edit, such as lastUsedAt', () => {
		const parsed = zRecipeInput.parse({
			...validInput,
			_id: newId(),
			lastUsedAt: new Date(),
		});

		expect(parsed).not.toHaveProperty('_id');
		expect(parsed).not.toHaveProperty('lastUsedAt');
	});
});
