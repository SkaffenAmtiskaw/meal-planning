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

describe('PlannerList', () => {
	test('renders a planner name', async () => {
		mockGetPlanners.mockResolvedValueOnce([
			{ _id: 'p1', name: "Ariel's Planner" },
		]);

		render(await PlannerList());

		expect(screen.getByText("Ariel's Planner")).toBeDefined();
	});

	test('renders multiple planner names', async () => {
		mockGetPlanners.mockResolvedValueOnce([
			{ _id: 'p1', name: "Ariel's Planner" },
			{ _id: 'p2', name: "Eric's Planner" },
		]);

		render(await PlannerList());

		expect(screen.getByText("Ariel's Planner")).toBeDefined();
		expect(screen.getByText("Eric's Planner")).toBeDefined();
	});
});
