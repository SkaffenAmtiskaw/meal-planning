import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CreatePlannerForm } from './CreatePlannerForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockCreatePlanner = vi.hoisted(() => vi.fn());

vi.mock('@/_actions/planner', () => ({
	createPlanner: mockCreatePlanner,
}));

const mockRefresh = vi.fn();

const defaultRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	refresh: vi.fn(),
	back: vi.fn(),
	forward: vi.fn(),
	prefetch: vi.fn(),
};

beforeAll(() => {
	vi.mocked(useRouter).mockReturnValue({
		...defaultRouter,
		refresh: mockRefresh,
	});
});

const mockOnClose = vi.fn();

describe('CreatePlannerForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls createPlanner with input value on submit', async () => {
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

	it('calls onClose and refreshes router on success', async () => {
		mockCreatePlanner.mockResolvedValue({ ok: true });
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	it('shows error when createPlanner returns error', async () => {
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

	it('does not call onClose on error', async () => {
		mockCreatePlanner.mockResolvedValue({ ok: false, error: 'Invalid name' });
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});

		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it('calls onClose when cancel is clicked', () => {
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('cancel-create-button'));

		expect(mockOnClose).toHaveBeenCalled();
	});
});
