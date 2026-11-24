import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRecipeTags } from '@/_actions/library';

import { InlineTagsEditor } from './InlineTagsEditor';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock(
	'@/_actions/library',
	async () => await import('#mocks/@/_actions/library'),
);

vi.mock('@/_hooks/useEditMode', async () => {
	const { useEditMode } = await import('#mocks/@/_hooks');
	return { useEditMode };
});

let capturedOnChange: ((value: string[]) => void) | undefined;

vi.mock(
	'@/app/[planner]/_components/Tag/Tag',
	async () => await import('#mocks/@/app/[planner]/_components/Tag/Tag'),
);

vi.mock('../../_components/TagCombobox', () => ({
	TagCombobox: vi.fn(({ value, onChange, plannerId, tags }) => {
		capturedOnChange = onChange;
		return (
			<div
				data-testid="tag-combobox"
				data-planner-id={plannerId}
				data-value={value.join(',')}
				data-tags-count={tags.length}
			/>
		);
	}),
}));

const defaultProps = {
	plannerId: 'planner-1',
	recipeId: 'recipe-1',
	tagIds: ['tag-1'],
	availableTags: [
		{ _id: 'tag-1', name: 'Spicy', color: 'tangerine' },
		{ _id: 'tag-2', name: 'Sweet', color: 'steel' },
	],
};

describe('InlineTagsEditor', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		capturedOnChange = undefined;
	});

	it('renders tag pills and edit button in read mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.getByText('Spicy')).toBeDefined();
		expect(screen.getByTestId('tags-edit-button')).toBeDefined();
		expect(screen.queryByTestId('tag-combobox')).toBeNull();
	});

	it('does not render save/cancel buttons in read mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.queryByTestId('tags-save-button')).toBeNull();
		expect(screen.queryByTestId('tags-cancel-button')).toBeNull();
	});

	it('renders empty tags group when no matching tags', () => {
		render(<InlineTagsEditor {...defaultProps} tagIds={[]} />);
		expect(screen.getByTestId('tags')).toBeDefined();
		expect(screen.queryByText('Spicy')).toBeNull();
	});

	it('does not render pill for unknown tag id', () => {
		render(<InlineTagsEditor {...defaultProps} tagIds={['unknown-id']} />);
		expect(screen.queryByText('Spicy')).toBeNull();
	});

	it('pills follow a new tagIds prop', () => {
		const { rerender } = render(<InlineTagsEditor {...defaultProps} />);
		rerender(<InlineTagsEditor {...defaultProps} tagIds={['tag-2']} />);
		expect(screen.getByText('Sweet')).toBeDefined();
		expect(screen.queryByText('Spicy')).toBeNull();
	});

	it('editing starts from the current tagIds prop', () => {
		const { rerender } = render(<InlineTagsEditor {...defaultProps} />);
		rerender(<InlineTagsEditor {...defaultProps} tagIds={['tag-2']} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-value')).toBe('tag-2');
	});

	it('an edit in progress survives a tagIds prop change', () => {
		const { rerender } = render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		act(() => {
			capturedOnChange?.([]);
		});
		rerender(<InlineTagsEditor {...defaultProps} tagIds={['tag-2']} />);
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-value')).toBe('');
	});

	it('clicking edit button switches to edit mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		expect(screen.getByTestId('tag-combobox')).toBeDefined();
		expect(screen.getByTestId('tags-save-button')).toBeDefined();
		expect(screen.getByTestId('tags-cancel-button')).toBeDefined();
		expect(screen.queryByTestId('tags-edit-button')).toBeNull();
	});

	it('TagCombobox onChange updates internal value', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		act(() => {
			capturedOnChange?.(['tag-1', 'tag-2']);
		});
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-value')).toBe('tag-1,tag-2');
	});

	it('cancel drops the edit and exits edit mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		act(() => {
			capturedOnChange?.(['tag-1', 'tag-2']);
		});
		fireEvent.click(screen.getByTestId('tags-cancel-button'));
		expect(screen.queryByTestId('tag-combobox')).toBeNull();
		expect(screen.getByText('Spicy')).toBeDefined();
		expect(screen.queryByText('Sweet')).toBeNull();
	});

	it('save calls updateRecipeTags with the edited tags', async () => {
		vi.mocked(updateRecipeTags).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		act(() => {
			capturedOnChange?.(['tag-1', 'tag-2']);
		});
		fireEvent.click(screen.getByTestId('tags-save-button'));

		await waitFor(() => {
			expect(updateRecipeTags).toHaveBeenCalledWith({
				plannerId: 'planner-1',
				recipeId: 'recipe-1',
				tags: ['tag-1', 'tag-2'],
			});
		});
	});

	it('save exits editing mode after success', async () => {
		vi.mocked(updateRecipeTags).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		fireEvent.click(screen.getByTestId('tags-save-button'));

		await waitFor(() => {
			expect(screen.queryByTestId('tag-combobox')).toBeNull();
		});
	});

	it('shows error message and stays in editing mode when save fails', async () => {
		vi.mocked(updateRecipeTags).mockResolvedValueOnce({
			ok: false,
			error: 'Unauthorized',
		});
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		fireEvent.click(screen.getByTestId('tags-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error').textContent).toBe('Unauthorized');
			expect(screen.getByTestId('tag-combobox')).toBeDefined();
		});
	});

	it('cancel clears save error', async () => {
		vi.mocked(updateRecipeTags).mockResolvedValueOnce({
			ok: false,
			error: 'Unauthorized',
		});
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		fireEvent.click(screen.getByTestId('tags-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error')).toBeDefined();
		});

		fireEvent.click(screen.getByTestId('tags-cancel-button'));
		expect(screen.queryByTestId('save-error')).toBeNull();
	});

	it('shows generic error when updateRecipeTags throws unexpectedly', async () => {
		vi.mocked(updateRecipeTags).mockRejectedValueOnce(
			new Error('Network failure'),
		);
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		fireEvent.click(screen.getByTestId('tags-save-button'));

		await waitFor(() => {
			expect(screen.getByTestId('save-error').textContent).toBe(
				'An unexpected error occurred',
			);
			expect(screen.getByTestId('tag-combobox')).toBeDefined();
		});
	});
});
