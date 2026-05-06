import { useRouter } from 'next/navigation';

import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRecipeTags } from '@/_actions/library';

import { InlineTagsEditor } from './InlineTagsEditor';

const mockRefresh = vi.fn();

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('@/_actions/library', () => ({
	updateRecipeTags: vi.fn(),
}));

let capturedOnChange: ((value: string[]) => void) | undefined;

vi.mock('@/_components', () => ({
	Tag: vi.fn(({ children }) => <span>{children}</span>),
	TagCombobox: vi.fn(({ value, onChange, plannerId, initialTags }) => {
		capturedOnChange = onChange;
		return (
			<div
				data-testid="tag-combobox"
				data-planner-id={plannerId}
				data-value={value.join(',')}
				data-initial-tags-count={initialTags.length}
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
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			refresh: mockRefresh,
		});
	});

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

	it('cancel resets value and exits edit mode', () => {
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

	it('save calls updateRecipeTags with correct args then refreshes', async () => {
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
			expect(mockRefresh).toHaveBeenCalledOnce();
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
		expect(mockRefresh).not.toHaveBeenCalled();
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
		expect(mockRefresh).not.toHaveBeenCalled();
	});
});
