import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { updateRecipeNotes } from '@/_actions/saved';

import { InlineNotesEditor } from './InlineNotesEditor';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/saved', () => ({
	updateRecipeNotes: vi.fn(),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const defaultProps = {
	plannerId: 'planner-1',
	recipeId: 'recipe-1',
	notes: 'Best served at midnight',
};

describe('InlineNotesEditor', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders notes text and edit button in read mode', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		expect(screen.getByTestId('notes').textContent).toBe(
			'Best served at midnight',
		);
		expect(screen.getByTestId('notes-edit-button')).toBeDefined();
		expect(screen.queryByTestId('notes-textarea')).toBeNull();
	});

	test('renders without notes when notes is undefined', () => {
		render(<InlineNotesEditor {...defaultProps} notes={undefined} />);
		expect(screen.getByTestId('notes')).toBeDefined();
		expect(screen.getByTestId('notes-edit-button')).toBeDefined();
	});

	test('clicking edit button switches to editing mode', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		expect(screen.getByTestId('notes-textarea')).toBeDefined();
		expect(screen.getByTestId('notes-save-button')).toBeDefined();
		expect(screen.getByTestId('notes-cancel-button')).toBeDefined();
		expect(screen.queryByTestId('notes-edit-button')).toBeNull();
	});

	test('textarea is pre-populated with existing notes', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		const textarea = screen.getByTestId(
			'notes-textarea',
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe('Best served at midnight');
	});

	test('cancel restores original notes and exits editing mode', () => {
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

	test('save calls updateRecipeNotes with correct args then refreshes', async () => {
		vi.mocked(updateRecipeNotes).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
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
			expect(mockRefresh).toHaveBeenCalledOnce();
		});
	});

	test('save exits editing mode after success', async () => {
		vi.mocked(updateRecipeNotes).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('notes-textarea')).toBeNull();
		});
	});

	test('shows error message and stays in editing mode when save fails', async () => {
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
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	test('cancel clears save error', async () => {
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

	test('cancel when notes is undefined resets value to empty string', () => {
		render(<InlineNotesEditor {...defaultProps} notes={undefined} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.change(screen.getByTestId('notes-textarea'), {
			target: { value: 'something' },
		});
		fireEvent.click(screen.getByTestId('notes-cancel-button'));
		expect(screen.queryByTestId('notes-textarea')).toBeNull();
	});

	test('shows generic error when updateRecipeNotes throws unexpectedly', async () => {
		vi.mocked(updateRecipeNotes).mockRejectedValueOnce(
			new Error('Network failure'),
		);
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.click(screen.getByTestId('notes-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error').textContent).toBe(
				'An unexpected error occurred',
			);
			expect(screen.getByTestId('notes-textarea')).toBeDefined();
		});
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	test('textarea updates as user types', () => {
		render(<InlineNotesEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('notes-edit-button'));
		fireEvent.change(screen.getByTestId('notes-textarea'), {
			target: { value: 'New content' },
		});
		const textarea = screen.getByTestId(
			'notes-textarea',
		) as HTMLTextAreaElement;
		expect(textarea.value).toBe('New content');
	});
});
