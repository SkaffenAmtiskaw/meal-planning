import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { deleteBookmark } from '@/_actions/saved';

import { DeleteBookmarkButton } from './DeleteBookmarkButton';

vi.mock('@/_actions/saved', () => ({
	deleteBookmark: vi.fn(),
}));

vi.mock('./DeleteItemButton', () => ({
	DeleteItemButton: ({
		onDelete,
		title,
		message,
		'data-testid': testId,
	}: {
		onDelete: () => Promise<unknown>;
		title: string;
		message: string;
		'data-testid'?: string;
	}) => (
		<div>
			<span data-testid="title">{title}</span>
			<span data-testid="message">{message}</span>
			<button
				data-testid={testId ?? 'delete-button'}
				onClick={onDelete}
				type="button"
			>
				Delete
			</button>
		</div>
	),
}));

const plannerId = '507f1f77bcf86cd799439011';
const bookmarkId = '507f1f77bcf86cd799439012';

describe('DeleteBookmarkButton', () => {
	test('renders with correct title and message', () => {
		render(
			<DeleteBookmarkButton plannerId={plannerId} bookmarkId={bookmarkId} />,
		);
		expect(screen.getByTestId('title').textContent).toBe('Delete Bookmark');
		expect(screen.getByTestId('message').textContent).toBe(
			'Are you sure you want to delete this bookmark? This cannot be undone.',
		);
	});

	test('passes delete-bookmark-button testid', () => {
		render(
			<DeleteBookmarkButton plannerId={plannerId} bookmarkId={bookmarkId} />,
		);
		expect(screen.getByTestId('delete-bookmark-button')).toBeDefined();
	});

	test('onDelete calls deleteBookmark with correct args', async () => {
		vi.mocked(deleteBookmark).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(
			<DeleteBookmarkButton plannerId={plannerId} bookmarkId={bookmarkId} />,
		);
		fireEvent.click(screen.getByTestId('delete-bookmark-button'));
		expect(deleteBookmark).toHaveBeenCalledWith({ plannerId, bookmarkId });
	});
});
