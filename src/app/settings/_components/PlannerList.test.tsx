import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerList } from './PlannerList';

const { mockGetPlanners } = vi.hoisted(() => ({
	mockGetPlanners: vi.fn(),
}));

vi.mock('@/_actions/planner', () => ({
	getPlanners: mockGetPlanners,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./PlannerItem', () => ({
	PlannerItem: ({ id, name }: { id: string; name: string }) => (
		<div data-testid={`planner-item-${id}`} data-name={name} />
	),
}));

vi.mock('./PlannerListActions', () => ({
	PlannerListActions: () => <div data-testid="planner-list-actions" />,
}));

describe('PlannerList', () => {
	test('renders a PlannerItem for each planner', async () => {
		mockGetPlanners.mockResolvedValueOnce([
			{ _id: 'p1', name: "Ariel's Planner" },
			{ _id: 'p2', name: "Eric's Planner" },
		]);

		render(await PlannerList());

		expect(screen.getByTestId('planner-item-p1')).toBeDefined();
		expect(screen.getByTestId('planner-item-p2')).toBeDefined();
	});

	test('renders PlannerListActions', async () => {
		mockGetPlanners.mockResolvedValueOnce([]);

		render(await PlannerList());

		expect(screen.getByTestId('planner-list-actions')).toBeDefined();
	});

	test('passes id and name to PlannerItem', async () => {
		mockGetPlanners.mockResolvedValueOnce([
			{ _id: 'p1', name: "Ariel's Planner" },
		]);

		render(await PlannerList());

		expect(
			screen.getByTestId('planner-item-p1').getAttribute('data-name'),
		).toBe("Ariel's Planner");
	});

	test('uses empty string when planner name is null', async () => {
		mockGetPlanners.mockResolvedValueOnce([{ _id: 'p1', name: null }]);

		render(await PlannerList());

		expect(
			screen.getByTestId('planner-item-p1').getAttribute('data-name'),
		).toBe('');
	});
});
