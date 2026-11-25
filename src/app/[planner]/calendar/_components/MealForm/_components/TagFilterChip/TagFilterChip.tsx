'use client';

import { Chip, Text } from '@mantine/core';

import { TAG_COLORS } from '@/_theme/colors';

import classes from './TagFilterChip.module.css';

import type { TagFilterOption } from '../../_utils/types';

type Props = { option: TagFilterOption };

/**
 * One tag in the tag filter: a dot in the tag's color, its name, and how many
 * results carry it while it's unselected. Selected, it's filled with the tag's
 * own colors. It sits in TagFilter's Chip.Group, which decides whether it's
 * checked from its value, so it's a Client Component.
 */
export const TagFilterChip = ({ option: { tag, count } }: Props) => (
	<Chip value={tag._id} variant="tag" color={tag.color} icon={null}>
		<span className={classes.content}>
			<span
				className={classes.dot}
				// The dot takes the tag's own palette color, which varies per tag, so it can't sit in the CSS module.
				style={{ backgroundColor: TAG_COLORS[tag.color].border }}
				aria-hidden="true"
			/>
			{tag.name}
			{count !== null && (
				<Text
					component="span"
					size="xs"
					c="var(--text-muted)"
					data-testid="tag-count"
				>
					{count}
				</Text>
			)}
		</span>
	</Chip>
);
