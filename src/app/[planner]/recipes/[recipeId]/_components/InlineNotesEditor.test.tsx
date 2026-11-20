import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRecipeNotes } from '@/_actions/library';
import { catchify } from '@/_utils/catchify';

import { InlineNotesEditor } from './InlineNotesEditor';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'@/_actions/library',
	async () => await import('#mocks/@/_actions/library'),
);

vi.mock('@/_hooks/useEditMode', async () => {
	const { useEditMode } = await import('#mocks/@/_hooks');
	return { useEditMode };
});

vi.mock('@/_utils/catchify', () => ({
	catchify: vi.fn(async (fn) => [await fn(), undefined]),
}));

const defaultProps = {
	plannerId: 'planner-1',
	recipeId: 'recipe-1',
	notes: 'Best served at midnight',
};

describe('InlineNotesEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders notes text and edit button in read mode', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		expect(screen.getByTestId('notes').textContent).toBe(
			'Best served at midnight',
		);
		expect(screen.getByTestId('notes-edit-button')).toBeDefined();
		expect(screen.queryByTestId('notes-textarea')).toBeNull();
	});

	it('renders without notes when notes is undefined', () => {
		render(<InlineNotesEditor {...defaultProps} notes={undefined} />);
		expect(screen.getByTestId('notes')).toBeDefined();
		expect(screen.getByTestId('notes-edit-button')).toBeDefined();
	});

	it('clicking edit button switches to editing mode', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		expect(screen.getByTestId('notes-textarea')).toBeDefined();
		expect(screen.getByTestId('notes-save-button')).toBeDefined();
		expect(screen.getByTestId('notes-cancel-button')).toBeDefined();
		expect(screen.queryByTestId('notes-edit-button')).toBeNull();
	});

	it('editing starts from the current notes prop', () => {
		const { rerender } = render(<InlineNotesEditor {...defaultProps} />);
		rerender(<InlineNotesEditor {...defaultProps} notes="Now with lime" />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		const textarea = screen.getByTestId(
			'notes-textarea',
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe('Now with lime');
	});

	it('cancel exits editing mode and shows the saved notes', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.change(screen.getByTestId('notes-textarea'), {
			target: { value: 'changed text' },
		});
		fireEvent.click(screen.getByTestId('notes-cancel-button'));
		expect(screen.queryByTestId('notes-textarea')).toBeNull();
		expect(screen.getByTestId('notes').textContent).toBe(
			'Best served at midnight',
		);
	});

	it('save calls updateRecipeNotes with the edited notes', async () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.change(screen.getByTestId('notes-textarea'), {
			target: { value: 'Updated notes' },
		});
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(updateRecipeNotes).toHaveBeenCalledWith({
				plannerId: 'planner-1',
				recipeId: 'recipe-1',
				notes: 'Updated notes',
			});
		});
	});

	it('save exits editing mode after success', async () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('notes-textarea')).toBeNull();
		});
	});

	it('shows error message and stays in editing mode when save fails', async () => {
		vi.mocked(updateRecipeNotes).mockResolvedValueOnce({
			ok: false,
			error: 'Unauthorized',
		});
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error').textContent).toBe('Unauthorized');
			expect(screen.getByTestId('notes-textarea')).toBeDefined();
		});
	});

	it('cancel clears save error', async () => {
		vi.mocked(updateRecipeNotes).mockResolvedValueOnce({
			ok: false,
			error: 'Unauthorized',
		});
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error')).toBeDefined();
		});

		fireEvent.click(screen.getByTestId('notes-cancel-button'));
		expect(screen.queryByTestId('save-error')).toBeNull();
	});

	it('editing starts empty when there are no notes', () => {
		render(<InlineNotesEditor {...defaultProps} notes={undefined} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		const textarea = screen.getByTestId(
			'notes-textarea',
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe('');
	});

	it('reopening after cancel drops the cancelled edit', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.change(screen.getByTestId('notes-textarea'), {
			target: { value: 'something' },
		});
		fireEvent.click(screen.getByTestId('notes-cancel-button'));
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		const textarea = screen.getByTestId(
			'notes-textarea',
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe('Best served at midnight');
	});

	it('shows generic error when catchify returns an error', async () => {
		vi.mocked(catchify).mockResolvedValueOnce([
			undefined,
			new Error('Network failure'),
		]);
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error').textContent).toBe(
				'An unexpected error occurred',
			);
			expect(screen.getByTestId('notes-textarea')).toBeDefined();
		});
	});
});
