import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models';
import { zRecipeFormSchema } from '@/_models/planner/recipe.types';

import { addRecipe } from './addRecipe';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_models/planner/recipe.types', () => ({
	zRecipeFormSchema: {
		parse: vi.fn((data) => data),
	},
}));

vi.mock('./_utils/transformRecipeForm', () => ({
	transformRecipeForm: vi.fn((data) => data),
}));

vi.mock('@/_models', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));

const plannerId = new Types.ObjectId().toString();

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

	const makePlanner = () => {
		const saved: Array<{ _id: Types.ObjectId } & Record<string, unknown>> = [];
		const originalPush = Array.prototype.push.bind(saved);
		saved.push = (...items: Record<string, unknown>[]) =>
			originalPush(
				...items.map((item) => ({ _id: new Types.ObjectId(), ...item })),
			);
		return { saved, save: vi.fn().mockResolvedValue(undefined) };
	};

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

	test('persists the recipe and returns _id and name', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValueOnce(planner as never);

		const result = await addRecipe(validData);

		expect(planner.save).toHaveBeenCalledOnce();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.name).toBe('Croissant');
			expect(result.data._id).toMatch(/^[0-9a-f]{24}$/);
		}
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
			tags: [new Types.ObjectId().toString()],
		});

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.name).toBe('Croissant');
	});
});
