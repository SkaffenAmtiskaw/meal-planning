import { afterEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models/planner';
import { matchesId } from '@/_utils/matchesId';

import { deleteRecipe } from './deleteRecipe';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

vi.mock('@/_utils/matchesId', async () => ({
	matchesId: vi.fn(),
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

	it('throws on invalid input', async () => {
		await expect(deleteRecipe({})).rejects.toThrow();
	});

	it('returns Unauthorized when user is unauthenticated', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	it('returns Unauthorized when user is unauthorized', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	it('returns Planner not found when planner does not exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	it('returns Recipe not found when recipe is not in saved', async () => {
		const planner = makePlanner(false);
		vi.mocked(matchesId).mockReturnValue(() => false);
		vi.mocked(Planner.findById).mockResolvedValue(planner);

		const result = await deleteRecipe(validData);

		expect(result).toEqual({ ok: false, error: 'Recipe not found' });
		expect(planner.save).not.toHaveBeenCalled();
	});

	it('removes the recipe and returns ok', async () => {
		const planner = makePlanner();
		vi.mocked(matchesId).mockReturnValue(() => true);
		vi.mocked(Planner.findById).mockResolvedValue(planner);

		const result = await deleteRecipe(validData);

		expect(planner.saved).toHaveLength(0);
		expect(planner.save).toHaveBeenCalledOnce();
		expect(result).toEqual({ ok: true, data: undefined });
	});
});
