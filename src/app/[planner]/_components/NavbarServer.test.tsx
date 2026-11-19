import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanners } from '@/_actions/planner';

import { Navbar } from './Navbar';
import { NavbarServer } from './NavbarServer';

vi.mock(
	'@/_actions/planner',
	async () => await import('#mocks/@/_actions/planner'),
);

vi.mock('./Navbar', () => ({
	Navbar: vi.fn(() => null),
}));

describe('NavbarServer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('passes current id and fetched planners to Navbar', async () => {
		const plannerId = '507f1f77bcf86cd799439011';
		vi.mocked(getPlanners).mockResolvedValue([
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
		] as unknown as Awaited<ReturnType<typeof getPlanners>>);

		render(await NavbarServer({ id: plannerId }));

		expect(vi.mocked(Navbar)).toHaveBeenCalledWith(
			expect.objectContaining({
				id: plannerId,
				planners: [{ id: plannerId, name: "Ariel's Planner" }],
			}),
			undefined,
		);
	});
});
