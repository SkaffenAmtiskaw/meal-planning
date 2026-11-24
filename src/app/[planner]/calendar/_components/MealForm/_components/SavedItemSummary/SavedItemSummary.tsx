import { Group, Stack, Text } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';
import { Tag } from '@/app/[planner]/_components/Tag/Tag';

const KIND_LABELS: Record<SavedItem['kind'], string> = {
	recipe: 'Recipe',
	bookmark: 'Bookmark',
};

// A saved recipe's name, its kind in muted text, and its tags as small badges.
export const SavedItemSummary = ({ item }: { item: SavedItem }) => (
	<Stack gap={4} miw={0}>
		<Text size="sm" fw={500}>
			{item.name}{' '}
			<Text span size="xs" fw={400} c="var(--text-muted)">
				{KIND_LABELS[item.kind]}
			</Text>
		</Text>
		{item.tags.length > 0 && (
			<Group gap={4}>
				{item.tags.map((tag) => (
					<Tag key={tag._id} color={tag.color} compact>
						{tag.name}
					</Tag>
				))}
			</Group>
		)}
	</Stack>
);
