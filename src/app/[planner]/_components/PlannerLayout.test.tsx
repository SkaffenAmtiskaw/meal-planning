import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerLayout } from './PlannerLayout';

vi.mock('next/navigation', () => ({
	useParams: () => ({ planner: 'maleficent-planner-id' }),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => [false, { toggle: vi.fn() }],
}));

vi.mock('./useLastOpenedPlanner', () => ({
	useLastOpenedPlanner: vi.fn(),
}));

const mockHeader = vi.fn<(props: { leftSection?: React.ReactNode }) => null>(
	() => null,
);
vi.mock('@/app/_components/Header', () => ({
	Header: (props: { leftSection?: React.ReactNode }) => mockHeader(props),
}));

describe('PlannerLayout', () => {
	test('renders children', () => {
		render(<PlannerLayout>{"Ursula's Menu"}</PlannerLayout>);

		expect(screen.getByText("Ursula's Menu")).toBeDefined();
	});

	test('renders navbar prop', () => {
		render(
			<PlannerLayout navbar={<div data-testid="test-navbar" />}>
				{'content'}
			</PlannerLayout>,
		);

		expect(screen.getByTestId('test-navbar')).toBeDefined();
	});

	test('passes Burger as leftSection to Header', () => {
		render(<PlannerLayout>{'content'}</PlannerLayout>);

		expect(mockHeader).toHaveBeenCalledWith(
			expect.objectContaining({ leftSection: expect.anything() }),
		);
	});
});
