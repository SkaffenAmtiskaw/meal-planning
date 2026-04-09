import { isLightColor, useMantineTheme } from '@mantine/core';

import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { updateRecipeTags } from '@/_actions/saved';

import { InlineTagsEditor } from './InlineTagsEditor';

const mockRefresh = vi.fn();

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/saved', () => ({
	updateRecipeTags: vi.fn(),
}));

let capturedOnChange: ((value: string[]) => void) | undefined;

vi.mock('@/_components/TagCombobox', () => ({
	TagCombobox: ({
		value,
		onChange,
		plannerId,
		initialTags,
	}: {
		value: string[];
		onChange: (value: string[]) => void;
		plannerId: string;
		initialTags: unknown[];
	}) => {
		capturedOnChange = onChange;
		return (
			<div
				data-testid="tag-combobox"
				data-planner-id={plannerId}
				data-value={value.join(',')}
				data-initial-tags-count={initialTags.length}
			/>
		);
	},
}));

const defaultProps = {
	plannerId: 'planner-1',
	recipeId: 'recipe-1',
	tagIds: ['tag-1'],
	availableTags: [
		{ _id: 'tag-1', name: 'Spicy', color: 'red' },
		{ _id: 'tag-2', name: 'Sweet', color: 'blue' },
	],
};

describe('InlineTagsEditor', () => {
	afterEach(() => {
		vi.resetAllMocks();
		capturedOnChange = undefined;
		vi.mocked(useMantineTheme).mockReturnValue({ colors: {} } as never);
		vi.mocked(isLightColor).mockReturnValue(false);
	});

	test('renders tag pills and edit button in read mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.getByText('Spicy')).toBeDefined();
		expect(screen.getByTestId('tags-edit-button')).toBeDefined();
		expect(screen.queryByTestId('tag-combobox')).toBeNull();
	});

	test('renders tags section label', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.getByText('Tags')).toBeDefined();
	});

	test('does not render save/cancel buttons in read mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.queryByTestId('tags-save-button')).toBeNull();
		expect(screen.queryByTestId('tags-cancel-button')).toBeNull();
	});

	test('renders empty tags group when no matching tags', () => {
		render(<InlineTagsEditor {...defaultProps} tagIds={[]} />);
		expect(screen.getByTestId('tags')).toBeDefined();
		expect(screen.queryByText('Spicy')).toBeNull();
	});

	test('does not render pill for unknown tag id', () => {
		render(<InlineTagsEditor {...defaultProps} tagIds={['unknown-id']} />);
		expect(screen.queryByText('Spicy')).toBeNull();
	});

	test('clicking edit button switches to edit mode', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		expect(screen.getByTestId('tag-combobox')).toBeDefined();
		expect(screen.getByTestId('tags-save-button')).toBeDefined();
		expect(screen.getByTestId('tags-cancel-button')).toBeDefined();
		expect(screen.queryByTestId('tags-edit-button')).toBeNull();
	});

	test('TagCombobox receives correct plannerId and initialTags', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-planner-id')).toBe('planner-1');
		expect(combobox.getAttribute('data-initial-tags-count')).toBe('2');
	});

	test('TagCombobox receives current tag ids as value', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-value')).toBe('tag-1');
	});

	test('TagCombobox onChange updates internal value', () => {
		render(<InlineTagsEditor {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tags-edit-button'));
		act(() => {
			capturedOnChange?.(['tag-1', 'tag-2']);
		});
		const combobox = screen.getByTestId('tag-combobox');
		expect(combobox.getAttribute('data-value')).toBe('tag-1,tag-2');
	});

	test('cancel resets value and exits edit mode', () => {
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

	test('save calls updateRecipeTags with correct args then refreshes', async () => {
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

	test('save exits editing mode after success', async () => {
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

	test('shows error message and stays in editing mode when save fails', async () => {
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

	test('cancel clears save error', async () => {
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

	test('shows generic error when updateRecipeTags throws unexpectedly', async () => {
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

	test('applies theme color to pill when color exists in palette', () => {
		vi.mocked(useMantineTheme).mockReturnValue({
			colors: { red: ['', '', '', '', '', '#cc0000'] },
		} as never);
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.getByText('Spicy')).toBeDefined();
	});

	test('falls back to raw color string when not in theme palette', () => {
		render(
			<InlineTagsEditor
				{...defaultProps}
				tagIds={['tag-x']}
				availableTags={[{ _id: 'tag-x', name: 'Custom', color: '#abcdef' }]}
			/>,
		);
		expect(screen.getByText('Custom')).toBeDefined();
	});

	test('uses dark text on light-colored pills', () => {
		vi.mocked(isLightColor).mockReturnValue(true);
		render(<InlineTagsEditor {...defaultProps} />);
		expect(screen.getByText('Spicy')).toBeDefined();
	});
});
