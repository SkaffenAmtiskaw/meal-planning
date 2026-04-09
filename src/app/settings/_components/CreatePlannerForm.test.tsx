import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { CreatePlannerForm } from './CreatePlannerForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

const mockCreatePlanner = vi.hoisted(() => vi.fn());
vi.mock('@/_actions/planner', () => ({
	createPlanner: mockCreatePlanner,
}));

const mockOnClose = vi.fn();

describe('CreatePlannerForm', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	test('renders nothing when closed', () => {
		render(<CreatePlannerForm opened={false} onClose={mockOnClose} />);

		expect(screen.queryByTestId('new-planner-name-input')).toBeNull();
	});

	test('renders name input and create button when open', () => {
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		expect(screen.getByTestId('new-planner-name-input')).toBeDefined();
		expect(screen.getByTestId('create-planner-button')).toBeDefined();
	});

	test('calls createPlanner with input value on submit', async () => {
		mockCreatePlanner.mockResolvedValue({ ok: true });
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.change(screen.getByTestId('new-planner-name-input'), {
			target: { value: 'Weekend Meals' },
		});
		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(mockCreatePlanner).toHaveBeenCalledWith('Weekend Meals');
		});
	});

	test('calls onClose and refreshes router on success', async () => {
		mockCreatePlanner.mockResolvedValue({ ok: true });
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	test('shows error when createPlanner returns error', async () => {
		mockCreatePlanner.mockResolvedValue({
			ok: false,
			error: 'Must be at least 1 character',
		});
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});
	});

	test('does not call onClose on error', async () => {
		mockCreatePlanner.mockResolvedValue({ ok: false, error: 'Invalid name' });
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});

		expect(mockOnClose).not.toHaveBeenCalled();
	});

	test('calls onClose when cancel is clicked', () => {
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('cancel-create-button'));

		expect(mockOnClose).toHaveBeenCalled();
	});
});
