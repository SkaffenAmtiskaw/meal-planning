import { usePathname, useRouter } from 'next/navigation';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { addBookmark, editBookmark } from '@/_actions/library';
import { TagCombobox } from '@/_components';

import { BookmarkForm } from './BookmarkForm';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

const mockPush = vi.fn();

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('@/_components', () => ({
	FormFeedbackAlert: vi.fn(),
	SubmitButton: vi.fn(() => null),
	TagCombobox: vi.fn(() => null),
}));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const defaultProps = {
	plannerId: 'planner-1',
	tags: [{ _id: 'tag-1', name: 'Quick', color: 'blue' }],
};

describe('BookmarkForm', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
		vi.mocked(usePathname).mockReturnValue('/planner-1/recipes');
	});

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

	test('navigates to pathname after successful add', async () => {
		render(<BookmarkForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('bookmark-form'));
		});

		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
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

	test('navigates to pathname on cancel', () => {
		render(<BookmarkForm {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});
});
