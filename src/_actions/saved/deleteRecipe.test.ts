import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { deleteRecipe } from './deleteRecipe';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', async () => {
	const { matchesId } = await import('@/_models/utils/matchesId');
	return {
		matchesId,
		Planner: {
			findById: vi.fn(),
		},
	};
});

const plannerId = new Types.ObjectId().toString();
const recipeId = new Types.ObjectId().toString();

const validData = { plannerId, recipeId };

describe('deleteRecipe', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	const makePlanner = (includeRecipe = true) => {
		const saved = includeRecipe ? [{ _id: recipeId }] : [];
		return {
			saved,
			save: vi.fn().mockResolvedValue(undefined),
		};
	};

	test('throws ZodError on invalid input', async () => {
		await expect(deleteRecipe({})).rejects.toThrow();
	});

	test('throws ZodError when plannerId is missing', async () => {
		await expect(deleteRecipe({ recipeId })).rejects.toThrow();
	});

	test('throws ZodError when recipeId is missing', async () => {
		await expect(deleteRecipe({ plannerId })).rejects.toThrow();
	});

	test('throws Unauthorized when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		await expect(deleteRecipe(validData)).rejects.toThrow('Unauthorized');
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('throws Unauthorized when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		await expect(deleteRecipe(validData)).rejects.toThrow('Unauthorized');
	});

	test('throws Planner not found when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(null);

		await expect(deleteRecipe(validData)).rejects.toThrow('Planner not found');
	});

	test('throws Recipe not found when recipeId is not in saved', async () => {
		const planner = makePlanner(false);
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		await expect(deleteRecipe(validData)).rejects.toThrow('Recipe not found');
		expect(planner.save).not.toHaveBeenCalled();
	});

	test('removes the recipe and saves the planner', async () => {
		const planner = makePlanner();
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		await deleteRecipe(validData);

		expect(planner.saved).toHaveLength(0);
		expect(planner.save).toHaveBeenCalledOnce();
	});
});
