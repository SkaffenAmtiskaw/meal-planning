import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { redirect } from 'next/navigation';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { getPlanner } from '@/_actions/planner/getPlanner';

import { Modal, SavedList } from './_components';
import RecipesPage from './page';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock(
	'@/_actions/planner/getPlanner',
	async () => await import('#mocks/@/_actions/planner/getPlanner'),
);

vi.mock('./_components', () => ({
	Modal: vi.fn(() => null),
	AddItemDropdown: () => null,
	SavedList: vi.fn(() => null),
}));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

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

	it('checks write access only when the URL has a status', async () => {
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner() as never);

		render(await RecipesPage({ params, searchParams }));

		expect(vi.mocked(checkAuth)).not.toHaveBeenCalled();
	});

	it('redirects to the plain list when the URL has a status without write access', async () => {
		vi.mocked(getPlanner).mockResolvedValueOnce(makePlanner() as never);
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		await RecipesPage({
			params,
			searchParams: Promise.resolve({
				status: 'add' as const,
				type: 'bookmark' as const,
			}),
		});

		expect(vi.mocked(checkAuth)).toHaveBeenCalledWith(plannerId, 'write');
		expect(vi.mocked(redirect)).toHaveBeenCalledWith(`/${plannerId}/recipes`);
		expect(vi.mocked(Modal)).not.toHaveBeenCalled();
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
