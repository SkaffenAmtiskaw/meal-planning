import { useParams } from 'next/navigation';

import { render } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PlannerLayout } from './PlannerLayout';
import { useLastOpenedPlanner } from './useLastOpenedPlanner';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./useLastOpenedPlanner', () => ({
	useLastOpenedPlanner: vi.fn(),
}));

vi.mock('./ToggleContext', () => ({
	ToggleProvider: ({ children }: { children: React.ReactNode }) => children,
	useToggleContext: vi.fn(() => ({ opened: false, toggle: vi.fn() })),
}));

describe('PlannerLayout', () => {
	beforeAll(() => {
		vi.mocked(useParams).mockReturnValue({ planner: 'maleficent-planner-id' });
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls useLastOpenedPlanner with planner id from params', () => {
		render(<PlannerLayout>content</PlannerLayout>);
		expect(useLastOpenedPlanner).toHaveBeenCalledWith('maleficent-planner-id');
	});
});
