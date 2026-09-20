import { render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlanners } from '@/_actions/planner';

import { PlannerItem } from './PlannerItem';
import { PlannerList } from './PlannerList';

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./PlannerItem', () => ({
	PlannerItem: vi.fn(() => <div data-testid="planner-item" />),
}));

vi.mock('./PlannerListActions', () => ({
	PlannerListActions: vi.fn(() => null),
}));

describe('PlannerList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders a PlannerItem for each planner', async () => {
		vi.mocked(getPlanners).mockResolvedValueOnce([
			{
				planner: {
					_id: 'p1',
					name: "Ariel's Planner",
					calendar: [],
					saved: [],
					tags: [],
				},
				accessLevel: 'owner',
			},
			{
				planner: {
					_id: 'p2',
					name: "Eric's Planner",
					calendar: [],
					saved: [],
					tags: [],
				},
				accessLevel: 'write',
			},
		] as unknown as Awaited<ReturnType<typeof getPlanners>>);

		render(await PlannerList());

		expect(screen.getAllByTestId('planner-item')).toHaveLength(2);
	});

	it('uses empty string when planner name is null', async () => {
		vi.mocked(getPlanners).mockResolvedValueOnce([
			{
				planner: {
					_id: 'p1',
					name: null,
					calendar: [],
					saved: [],
					tags: [],
				},
				accessLevel: 'owner',
			},
		] as unknown as Awaited<ReturnType<typeof getPlanners>>);

		render(await PlannerList());

		expect(vi.mocked(PlannerItem)).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'p1',
				name: '',
				accessLevel: 'owner',
			}),
			undefined,
		);
	});
});
