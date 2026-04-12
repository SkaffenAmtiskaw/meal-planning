import Link from 'next/link';

import { Anchor, Divider, Group, Stack } from '@mantine/core';

import { Tag } from '@/_components';
import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';
import type { TagInterface } from '@/_models/planner/tag.types';
import type { TagColor } from '@/_theme/colors';

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
	<Stack gap={0}>
		{items.map((item, index) => {
			const itemTags = (item.tags ?? [])
				.map((id) => tags.find((t) => String(t._id) === String(id)))
				.filter((t): t is TagInterface => t !== undefined);

			return (
				<div key={`${item._id}`}>
					{index > 0 && <Divider />}
					<Group justify="space-between" py="xs">
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
										<Tag key={`${tag._id}`} color={tag.color as TagColor}>
											{tag.name}
										</Tag>
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
				</div>
			);
		})}
	</Stack>
);

export { SavedList };
