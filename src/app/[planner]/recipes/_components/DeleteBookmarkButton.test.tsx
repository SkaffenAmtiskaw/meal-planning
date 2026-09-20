import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteBookmark } from '@/_actions/library';

import { DeleteBookmarkButton } from './DeleteBookmarkButton';
import { DeleteItemButton } from './DeleteItemButton';

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

vi.mock('./DeleteItemButton', () => ({
	DeleteItemButton: vi.fn(() => null),
}));

describe('DeleteBookmarkButton', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const bookmarkId = '507f1f77bcf86cd799439012';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls deleteBookmark with correct args when onDelete is invoked', async () => {
		render(
			<DeleteBookmarkButton plannerId={plannerId} bookmarkId={bookmarkId} />,
		);

		const onDelete = vi.mocked(DeleteItemButton).mock.calls[0][0].onDelete;
		await onDelete();

		expect(deleteBookmark).toHaveBeenCalledWith({ plannerId, bookmarkId });
	});
});
