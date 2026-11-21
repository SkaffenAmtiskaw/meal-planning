import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createPlanner } from '@/_actions/planner';

import { CreatePlannerForm } from './CreatePlannerForm';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'@/_actions/planner',
	async () => await import('#mocks/@/_actions/planner'),
);

describe('CreatePlannerForm', () => {
	const mockOnCancel = vi.fn();
	const mockOnSuccess = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls createPlanner with input value on submit', () => {
		render(
			<CreatePlannerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />,
		);

		fireEvent.change(screen.getByTestId('new-planner-name-input'), {
			target: { value: 'Weekend Meals' },
		});
		fireEvent.click(screen.getByTestId('create-planner-button'));

		expect(createPlanner).toHaveBeenCalledWith('Weekend Meals');
	});

	it('calls onSuccess after a save', async () => {
		render(
			<CreatePlannerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />,
		);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(mockOnSuccess).toHaveBeenCalled();
		});
	});

	it('shows the error and does not call onSuccess when createPlanner fails', async () => {
		vi.mocked(createPlanner).mockResolvedValueOnce({
			ok: false,
			error: 'Must be at least 1 character',
		});
		render(
			<CreatePlannerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />,
		);

		fireEvent.click(screen.getByTestId('create-planner-button'));

		await waitFor(() => {
			expect(screen.getByTestId('create-planner-error')).toBeDefined();
		});
		expect(mockOnSuccess).not.toHaveBeenCalled();
	});

	it('calls onCancel when cancel is clicked', () => {
		render(
			<CreatePlannerForm onCancel={mockOnCancel} onSuccess={mockOnSuccess} />,
		);

		fireEvent.click(screen.getByTestId('cancel-create-button'));

		expect(mockOnCancel).toHaveBeenCalled();
	});
});
