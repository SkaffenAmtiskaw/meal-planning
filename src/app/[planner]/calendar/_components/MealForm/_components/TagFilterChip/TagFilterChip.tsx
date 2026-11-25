'use client';

import { Chip, ColorSwatch, Group, Text } from '@mantine/core';

import { TAG_COLORS } from '@/_theme/colors';

import type { TagFilterOption } from '../../_utils/types';

type Props = { option: TagFilterOption };

/**
 * One tag in the tag filter: a dot in the tag's color, its name, and how many
 * results carry it while it's unselected. Selected, it's filled with the tag's
 * own colors. It sits in TagFilter's Chip.Group, which decides whether it's
 * checked from its value, so it's a Client Component.
 */
export const TagFilterChip = ({ option }: Props) => {
	const { tag } = option;
	return (
		<Chip value={tag._id} variant="tag" color={tag.color} icon={null}>
			<Group component="span" gap={6} wrap="nowrap">
				<ColorSwatch
					component="span"
					color={TAG_COLORS[tag.color].border}
					size={6}
					withShadow={false}
					aria-hidden="true"
				/>
				{tag.name}
				{!option.selected && (
					<Text
						component="span"
						size="xs"
						c="var(--text-muted)"
						data-testid="tag-count"
					>
						{option.count}
					</Text>
				)}
			</Group>
		</Chip>
	);
};
