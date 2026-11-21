import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { addBookmark, editBookmark } from '@/_actions/library';

import { BookmarkForm } from './BookmarkForm';

import { TagCombobox } from '../TagCombobox';

vi.mock(
	'@/_actions/library',
	async () => await import('#mocks/@/_actions/library'),
);

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('@/_components', () => ({
	FormFeedbackAlert: vi.fn(),
	SubmitButton: vi.fn(() => null),
}));

vi.mock('../TagCombobox', () => ({
	TagCombobox: vi.fn(() => null),
}));

vi.mock('@mantine/form', async () => await import('#mocks/@mantine/form'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const onCancel = vi.fn();
const onSuccess = vi.fn();

const defaultProps = {
	plannerId: 'planner-1',
	tags: [{ _id: 'tag-1', name: 'Quick', color: 'blue' }],
	onCancel,
	onSuccess,
};

describe('BookmarkForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('calls addBookmark with plannerId on submit', () => {
		render(<BookmarkForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('bookmark-form'));

		expect(addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
		);
	});

	test('calls onSuccess after a successful save', async () => {
		render(<BookmarkForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(onSuccess).toHaveBeenCalled();
		expect(onCancel).not.toHaveBeenCalled();
	});

	test('submits with selected tags included', async () => {
		render(<BookmarkForm {...defaultProps} />);

		const tagCall = vi.mocked(TagCombobox).mock.calls[0][0];
		act(() => {
			tagCall.onChange(['tag-1']);
		});

		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(addBookmark).toHaveBeenCalledWith(
			expect.objectContaining({ tags: ['tag-1'] }),
		);
	});

	test('calls editBookmark with _id in edit mode', async () => {
		const item = {
			_id: 'bm-1' as never,
			name: 'My Site',
			url: 'https://example.com',
			tags: [],
		};

		render(<BookmarkForm {...defaultProps} item={item} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(editBookmark).toHaveBeenCalledWith(
			expect.objectContaining({
				_id: 'bm-1',
				plannerId: 'planner-1',
			}),
		);
		expect(addBookmark).not.toHaveBeenCalled();
	});

	test('calls onCancel when Cancel is clicked', () => {
		render(<BookmarkForm {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(onCancel).toHaveBeenCalled();
		expect(onSuccess).not.toHaveBeenCalled();
	});
});
