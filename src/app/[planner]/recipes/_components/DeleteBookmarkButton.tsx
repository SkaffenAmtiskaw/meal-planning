'use client';

import { deleteBookmark } from '@/_actions/saved';

import { DeleteItemButton } from './DeleteItemButton';

type Props = {
	plannerId: string;
	bookmarkId: string;
};

const DeleteBookmarkButton = ({ plannerId, bookmarkId }: Props) => (
	<DeleteItemButton
		data-testid="delete-bookmark-button"
		message="Are you sure you want to delete this bookmark? This cannot be undone."
		onDelete={() => deleteBookmark({ plannerId, bookmarkId })}
		title="Delete Bookmark"
	/>
);

export { DeleteBookmarkButton };
