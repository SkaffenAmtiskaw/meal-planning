import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { zRecipeFormSchema } from '@/_models/library';
import { Planner } from '@/_models/planner';

import { addRecipe } from './addRecipe';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('@/_models/library', () => ({
	zRecipeFormSchema: {
		parse: vi.fn((data) => data),
	},
}));

vi.mock('./_utils/transformRecipeForm', () => ({
	transformRecipeForm: vi.fn((data) => data),
}));

vi.mock('@/_models/planner', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';

const validData = {
	plannerId,
	name: 'Croissant',
	ingredients: ['2 cups flour', '1 stick butter'],
	instructions: ['Mix ingredients', 'Bake at 400°F'],
};

describe('addRecipe', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	const makePlanner = () => ({
		saved: [] as Array<Record<string, unknown>>,
		save: vi.fn().mockResolvedValue(undefined),
	});

	test('throws when schema validation fails', async () => {
		vi.mocked(zRecipeFormSchema.parse).mockImplementationOnce(() => {
			throw new Error('Validation failed');
		});

		await expect(addRecipe({})).rejects.toThrow('Validation failed');
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValueOnce(null);

		const result = await addRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('persists the recipe with a new id and returns that id and its name', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValueOnce(planner as never);

		const result = await addRecipe(validData);

		expect(planner.save).toHaveBeenCalledOnce();
		expect(planner.saved[0]._id).toBe('new-id');
		expect(result).toEqual({
			ok: true,
			data: { _id: 'new-id', name: 'Croissant' },
		});
	});

	test('accepts optional fields', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValueOnce(planner as never);

		const result = await addRecipe({
			...validData,
			notes: 'Best served warm',
			storage: 'Room temp up to 2 days',
			servings: 12,
			source: { name: 'Bakery Blog', url: 'https://example.com' },
			time: { prep: '30m', cook: '20m', total: '50m', actual: '55m' },
			tags: ['507f1f77bcf86cd799439013'],
		});

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.name).toBe('Croissant');
	});
});
