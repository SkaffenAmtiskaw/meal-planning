import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanner } from '@/_actions/planner';

import { Modal, SavedList } from './_components';
import RecipesPage from './page';

vi.mock('@/_utils/zObjectId', async () => {
	const { z } = await import('zod');
	return { zObjectId: z.string() };
});

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

vi.mock('./_components', () => ({
	Modal: vi.fn(() => null),
	AddItemDropdown: () => null,
	SavedList: vi.fn(() => null),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const plannerId = '507f1f77bcf86cd799439011';

const makePlanner = (
	saved: Array<{ _id: { toString: () => string }; name: string }> = [],
) => ({
	_id: { toString: () => plannerId },
	saved,
	calendar: [],
	tags: [],
});

describe('recipes page', () => {
	const params = Promise.resolve({ planner: plannerId });
	const searchParams = Promise.resolve({});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches planner and passes it to Modal', async () => {
		const planner = makePlanner();
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		render(await RecipesPage({ params, searchParams }));

		expect(getPlanner).toHaveBeenCalledWith(plannerId);
		expect(vi.mocked(Modal)).toHaveBeenCalledWith(
			expect.objectContaining({ planner }),
			undefined,
		);
	});

	it('passes search params to Modal when present', async () => {
		const planner = makePlanner();
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		const itemId = '507f1f77bcf86cd799439012';
		const searchParamsWithQuery = Promise.resolve({
			status: 'edit' as const,
			type: 'recipe' as const,
			item: itemId,
		});

		render(await RecipesPage({ params, searchParams: searchParamsWithQuery }));

		expect(vi.mocked(Modal)).toHaveBeenCalledWith(
			expect.objectContaining({
				item: itemId,
				status: 'edit',
				type: 'recipe',
			}),
			undefined,
		);
	});

	it('passes saved items, plannerId, and tags to SavedList', async () => {
		const saved = [
			{
				_id: { toString: () => '507f1f77bcf86cd799439012' },
				name: "Maleficent's Dragon Roast",
			},
		];
		const planner = makePlanner(saved);
		vi.mocked(getPlanner).mockResolvedValueOnce(planner as never);

		render(await RecipesPage({ params, searchParams }));

		expect(vi.mocked(SavedList)).toHaveBeenCalledWith(
			expect.objectContaining({
				items: planner.saved,
				plannerId,
				tags: planner.tags,
			}),
			undefined,
		);
	});
});
