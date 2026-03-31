import Link from 'next/link';

import { Anchor, Group, List, ListItem } from '@mantine/core';

import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

import { DeleteBookmarkButton } from './DeleteBookmarkButton';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { EditRecipeButton } from './EditRecipeButton';

type Props = {
	items: Array<RecipeInterface | BookmarkInterface>;
	plannerId: string;
};

const isBookmark = (
	item: RecipeInterface | BookmarkInterface,
): item is BookmarkInterface => !!(item as BookmarkInterface).url;

const SavedList = ({ items, plannerId }: Props) => (
	<List listStyleType="none">
		{items.map((item) => (
			<ListItem key={`${item._id}`}>
				<Group justify="space-between">
					{isBookmark(item) ? (
						<Anchor href={item.url} rel="noopener noreferrer" target="_blank">
							{item.name}
						</Anchor>
					) : (
						<Link href={`/${plannerId}/recipes/${item._id}`}>{item.name}</Link>
					)}
					<Group gap="xs">
						<EditRecipeButton
							href={`?item=${item._id}&status=edit&type=${isBookmark(item) ? 'bookmark' : 'recipe'}`}
						/>
						{isBookmark(item) ? (
							<DeleteBookmarkButton
								bookmarkId={`${item._id}`}
								plannerId={plannerId}
							/>
						) : (
							<DeleteRecipeButton
								plannerId={plannerId}
								recipeId={`${item._id}`}
							/>
						)}
					</Group>
				</Group>
			</ListItem>
		))}
	</List>
);

export { SavedList };
