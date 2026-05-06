import { useDisclosure } from '@mantine/hooks';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatePlannerForm } from './CreatePlannerForm';
import { PlannerListActions } from './PlannerListActions';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('./CreatePlannerForm', () => ({
	CreatePlannerForm: vi.fn(() => <div data-testid="create-planner-form" />),
}));

describe('PlannerListActions', () => {
	const mockOpen = vi.fn();
	const mockClose = vi.fn();

	beforeAll(() => {
		vi.mocked(useDisclosure).mockImplementation(() => [
			false,
			{ open: mockOpen, close: mockClose, toggle: vi.fn(), set: vi.fn() },
		]);
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('opens modal when new planner button is clicked', () => {
		render(<PlannerListActions />);

		fireEvent.click(screen.getByTestId('new-planner-button'));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('opens modal when FAB is clicked', () => {
		render(<PlannerListActions />);

		fireEvent.click(screen.getByTestId('new-planner-fab'));

		expect(mockOpen).toHaveBeenCalled();
	});

	it('calls close when CreatePlannerForm requests close', () => {
		render(<PlannerListActions />);

		const onClose = vi.mocked(CreatePlannerForm).mock.calls[0][0].onClose;

		onClose();

		expect(mockClose).toHaveBeenCalled();
	});
});
