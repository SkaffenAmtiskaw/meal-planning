import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import RecipesPage from './page';

vi.mock('@/_models', async () => {
	const { zObjectId } = await import('@/_models/_utils/zObjectId');
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

const mockModal = vi.fn<(props: ModalProps) => null>(() => null);
vi.mock('./_components', () => ({
	Modal: (props: ModalProps) => mockModal(props),
	AddItemDropdown: () => null,
}));

vi.mock('@mantine/core', () => ({
	Container: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Group: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

	test('renders saved item names', async () => {
		const saved = [
			{
				_id: { toString: () => '507f1f77bcf86cd799439012' },
				name: "Maleficent's Dragon Roast",
			},
			{
				_id: { toString: () => '507f1f77bcf86cd799439013' },
				name: "Ursula's Sea Witch Soup",
			},
		];
		mockGetPlanner.mockResolvedValue(makePlanner(saved));

		render(await RecipesPage({ params, searchParams }));

		expect(screen.getByText("Maleficent's Dragon Roast")).toBeDefined();
		expect(screen.getByText("Ursula's Sea Witch Soup")).toBeDefined();
	});
});
