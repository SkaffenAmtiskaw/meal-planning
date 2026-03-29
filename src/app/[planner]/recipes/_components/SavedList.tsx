import Link from 'next/link';

import { ActionIcon, Anchor, Group, List, ListItem } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';

import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

import { DeleteRecipeButton } from './DeleteRecipeButton';

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
						<ActionIcon data-testid="edit-button" disabled variant="subtle">
							<IconPencil size={16} />
						</ActionIcon>
						<DeleteRecipeButton
							disabled={isBookmark(item)}
							plannerId={plannerId}
							recipeId={`${item._id}`}
						/>
					</Group>
				</Group>
			</ListItem>
		))}
	</List>
);

export { SavedList };
