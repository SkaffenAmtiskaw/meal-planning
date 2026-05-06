import { useRouter } from 'next/navigation';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createPlanner } from '@/_actions/planner';

import { CreatePlannerForm } from './CreatePlannerForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

describe('CreatePlannerForm', () => {
	const mockOnClose = vi.fn();
	const mockRefresh = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls createPlanner with input value on submit', () => {
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.change(screen.getByTestId('new-planner-name-input'), {
			target: { value: 'Weekend Meals' },
		});
		fireEvent.click(screen.getByTestId('create-planner-button'));

		expect(createPlanner).toHaveBeenCalledWith('Weekend Meals');
	});

	it('calls onClose and refreshes router on success', async () => {
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(mockOnClose).toHaveBeenCalled();
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	it('shows error when createPlanner returns error', async () => {
		vi.mocked(createPlanner).mockResolvedValueOnce({
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
		vi.mocked(createPlanner).mockResolvedValueOnce({
			ok: false,
			error: 'Invalid name',
		});
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});

		expect(mockOnClose).not.toHaveBeenCalled();
	});

	it('calls onClose and clears error and name when cancel is clicked', async () => {
		vi.mocked(createPlanner).mockResolvedValueOnce({
			ok: false,
			error: 'Invalid name',
		});
		render(<CreatePlannerForm opened={true} onClose={mockOnClose} />);

		fireEvent.change(screen.getByTestId('new-planner-name-input'), {
			target: { value: 'Weekend Meals' },
		});
		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});

		fireEvent.click(screen.getByTestId('cancel-create-button'));

		expect(mockOnClose).toHaveBeenCalled();
		expect(screen.queryByTestId('create-planner-error')).toBeNull();
		expect(
			(screen.getByTestId('new-planner-name-input') as HTMLInputElement).value,
		).toBe('');
	});
});
