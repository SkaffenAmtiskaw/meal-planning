import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { matchesId, Planner } from '@/_models';

import { deleteRecipe } from './deleteRecipe';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_models', () => ({
	matchesId: vi.fn(),
	Planner: {
		findById: vi.fn(),
	},
}));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

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

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('returns Recipe not found error when recipeId is not in saved', async () => {
		const planner = makePlanner(false);
		vi.mocked(matchesId).mockReturnValue(() => false);
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		expect(planner.save).not.toHaveBeenCalled();
	});

	test('removes the recipe and returns ok', async () => {
		const planner = makePlanner();
		vi.mocked(matchesId).mockReturnValue(() => true);
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await deleteRecipe(validData);

		expect(planner.saved).toHaveLength(0);
		expect(planner.save).toHaveBeenCalledOnce();
		expect(result).toEqual({ ok: true, data: undefined });
	});
});
