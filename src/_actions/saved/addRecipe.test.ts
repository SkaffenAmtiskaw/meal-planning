import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { addRecipe } from './addRecipe';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
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

	const makeRecipeId = () => new Types.ObjectId();

	const makePlanner = (pushedRecipeId = makeRecipeId()) => {
		const saved: { _id: Types.ObjectId; name: string }[] = [];
		const origPush = saved.push.bind(saved);
		vi.spyOn(saved, 'push').mockImplementation((item: unknown) => {
			return origPush({ ...(item as object), _id: pushedRecipeId } as {
				_id: Types.ObjectId;
				name: string;
			});
		});
		return { saved, save: vi.fn().mockResolvedValue(undefined) };
	};

	test('throws ZodError on invalid input', async () => {
		await expect(addRecipe({})).rejects.toThrow();
	});

	test('throws ZodError when ingredients is missing', async () => {
		await expect(
			addRecipe({ ...validData, ingredients: undefined }),
		).rejects.toThrow();
	});

	test('throws Unauthorized when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		await expect(addRecipe(validData)).rejects.toThrow('Unauthorized');
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('throws Unauthorized when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		await expect(addRecipe(validData)).rejects.toThrow('Unauthorized');
	});

	test('throws Planner not found when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(null);

		await expect(addRecipe(validData)).rejects.toThrow('Planner not found');
	});

	test('persists the recipe and returns _id and name', async () => {
		const recipeId = makeRecipeId();
		const planner = makePlanner(recipeId);
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addRecipe(validData);

		expect(planner.save).toHaveBeenCalledOnce();
		expect(result).toEqual({ _id: recipeId.toString(), name: 'Croissant' });
	});

	test('accepts optional fields', async () => {
		const recipeId = makeRecipeId();
		const planner = makePlanner(recipeId);
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addRecipe({
			...validData,
			notes: 'Best served warm',
			storage: 'Room temp up to 2 days',
			servings: 12,
			source: { name: 'Bakery Blog', url: 'https://example.com' },
			time: { prep: '30m', cook: '20m', total: '50m', actual: '55m' },
			tags: [new Types.ObjectId().toString()],
		});

		expect(result.name).toBe('Croissant');
	});
});
