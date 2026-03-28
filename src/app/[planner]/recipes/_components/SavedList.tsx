import { ActionIcon, Anchor, Group, List, ListItem } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

import type { BookmarkInterface } from '@/_models/planner/bookmark';
import type { RecipeInterface } from '@/_models/planner/recipe';

type Props = {
	items: Array<RecipeInterface | BookmarkInterface>;
	plannerId: string;
};

const SavedList = ({ items, plannerId }: Props) => (
	<List listStyleType="none">
		{items.map((item) => (
			<ListItem key={`${item._id}`}>
				<Group justify="space-between">
					{'url' in item ? (
						<Anchor href={item.url} rel="noopener noreferrer" target="_blank">
							{item.name}
						</Anchor>
					) : (
						<Anchor href={`/${plannerId}/recipes/${item._id}`}>
							{item.name}
						</Anchor>
					)}
					<Group gap="xs">
						<ActionIcon data-testid="edit-button" disabled variant="subtle">
							<IconPencil size={16} />
						</ActionIcon>
						<ActionIcon
							color="red"
							data-testid="delete-button"
							disabled
							variant="subtle"
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				</Group>
			</ListItem>
		))}
	</List>
);

export { SavedList };
