import { render } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import RecipesPage from './page';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/utils/zObjectId');
	return { zObjectId };
});

const mockGetPlanner = vi.fn();
vi.mock('@/_actions', () => ({
	getPlanner: (...args: unknown[]) => mockGetPlanner(...args),
}));

type ModalProps = {
	planner: unknown;
	item?: unknown;
	status?: string;
	type?: string;
};

type SavedListProps = {
	items: unknown[];
	plannerId: string;
};

const mockModal = vi.fn<(props: ModalProps) => null>(() => null);
const mockSavedList = vi.fn<(props: SavedListProps) => null>(() => null);

vi.mock('./_components', () => ({
	Modal: (props: ModalProps) => mockModal(props),
	AddItemDropdown: () => null,
	SavedList: (props: SavedListProps) => mockSavedList(props),
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

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('passes planner data to Modal', async () => {
		const planner = makePlanner();
		mockGetPlanner.mockResolvedValue(planner);

		render(await RecipesPage({ params, searchParams }));

		expect(mockModal).toHaveBeenCalledWith(
			expect.objectContaining({ planner }),
		);
	});

	test('passes search params to Modal', async () => {
		const planner = makePlanner();
		mockGetPlanner.mockResolvedValue(planner);

		const searchParamsWithQuery = Promise.resolve({
			status: 'edit' as const,
			type: 'recipe' as const,
			item: '507f1f77bcf86cd799439012',
		});

		render(await RecipesPage({ params, searchParams: searchParamsWithQuery }));

		expect(mockModal).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'edit', type: 'recipe' }),
		);
	});

	test('passes saved items and plannerId to SavedList', async () => {
		const saved = [
			{
				_id: { toString: () => '507f1f77bcf86cd799439012' },
				name: "Maleficent's Dragon Roast",
			},
		];
		const planner = makePlanner(saved);
		mockGetPlanner.mockResolvedValue(planner);

		render(await RecipesPage({ params, searchParams }));

		expect(mockSavedList).toHaveBeenCalledWith(
			expect.objectContaining({ items: planner.saved, plannerId }),
		);
	});
});
