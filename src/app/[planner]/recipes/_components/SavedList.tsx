import Link from 'next/link';

import { Anchor, Badge, Group, List } from '@mantine/core';

import { FullWidthListItem } from '@/_components';
import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';
import type { TagInterface } from '@/_models/planner/tag.types';

import { DeleteBookmarkButton } from './DeleteBookmarkButton';
import { DeleteRecipeButton } from './DeleteRecipeButton';
import { EditRecipeButton } from './EditRecipeButton';
import classes from './SavedList.module.css';

type Props = {
	items: Array<RecipeInterface | BookmarkInterface>;
	plannerId: string;
	tags: TagInterface[];
};

const isBookmark = (
	item: RecipeInterface | BookmarkInterface,
): item is BookmarkInterface => !!(item as BookmarkInterface).url;

const SavedList = ({ items, plannerId, tags }: Props) => (
	<List listStyleType="none">
		{items.map((item) => {
			const itemTags = (item.tags ?? [])
				.map((id) => tags.find((t) => String(t._id) === String(id)))
				.filter((t): t is TagInterface => t !== undefined);

			return (
				<FullWidthListItem key={`${item._id}`}>
					<Group justify="space-between">
						<div className={classes.titleTags}>
							{isBookmark(item) ? (
								<Anchor
									href={item.url}
									rel="noopener noreferrer"
									target="_blank"
								>
									{item.name}
								</Anchor>
							) : (
								<Link href={`/${plannerId}/recipes/${item._id}`}>
									{item.name}
								</Link>
							)}
							{itemTags.length > 0 && (
								<Group gap="xs">
									{itemTags.map((tag) => (
										<Badge key={`${tag._id}`} color={tag.color} variant="light">
											{tag.name}
										</Badge>
									))}
								</Group>
							)}
						</div>
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
				</FullWidthListItem>
			);
		})}
	</List>
);

export { SavedList };
