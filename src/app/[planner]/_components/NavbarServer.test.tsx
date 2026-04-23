import { render } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { NavbarServer } from './NavbarServer';

const mockGetPlanners = vi.hoisted(() => vi.fn());
vi.mock('@/_actions/planner', () => ({
	getPlanners: mockGetPlanners,
}));

const mockNavbar = vi.fn<
	(props: { id: string; planners: { id: string; name: string }[] }) => null
>(() => null);
vi.mock('@/_components', () => ({
	Navbar: (props: { id: string; planners: { id: string; name: string }[] }) =>
		mockNavbar(props),
}));

describe('NavbarServer', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('passes current id and fetched planners to Navbar', async () => {
		const plannerId = '507f1f77bcf86cd799439011';
		mockGetPlanners.mockResolvedValue([
			{
				planner: {
					_id: plannerId,
					name: "Ariel's Planner",
					calendar: [],
					saved: [],
					tags: [],
				},
				accessLevel: 'owner',
			},
		]);

		render(await NavbarServer({ id: plannerId }));

		expect(mockNavbar).toHaveBeenCalledWith(
			expect.objectContaining({
				id: plannerId,
				planners: [{ id: plannerId, name: "Ariel's Planner" }],
			}),
		);
	});

	test('defaults to empty string when planner name is undefined', async () => {
		const plannerId = '507f1f77bcf86cd799439011';
		mockGetPlanners.mockResolvedValue([
			{
				planner: {
					_id: plannerId,
					name: undefined,
					calendar: [],
					saved: [],
					tags: [],
				},
				accessLevel: 'owner',
			},
		]);

		render(await NavbarServer({ id: plannerId }));

		expect(mockNavbar).toHaveBeenCalledWith(
			expect.objectContaining({
				planners: [{ id: plannerId, name: '' }],
			}),
		);
	});
});
