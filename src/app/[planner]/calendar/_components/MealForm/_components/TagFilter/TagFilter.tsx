'use client';

import { useState } from 'react';

import { Button, Chip, Group } from '@mantine/core';

import { limitTagChips } from '../../_utils/limitTagChips';
import type { TagFilterOption } from '../../_utils/types';
import { TagFilterChip } from '../TagFilterChip/TagFilterChip';

type Props = {
	// The chips in order, as rankTagOptions gives them.
	options: TagFilterOption[];
	// The selected tags' ids, in pick order.
	value: string[];
	onChange: (tagIds: string[]) => void;
};

/**
 * The tag filter's row of chips, which wraps: six at a time behind "+N more",
 * which shows them all and turns into "Fewer", and a Clear while any tag is
 * selected. Once expanded, it stays expanded until "Fewer", however the tags
 * change. Chip.Group adds each pick to the end of the value, so it keeps pick
 * order. Shows nothing when no tag would return anything.
 */
export const TagFilter = ({ options, value, onChange }: Props) => {
	const [expanded, setExpanded] = useState(false);
	const { shown, hiddenCount } = limitTagChips(options, expanded);

	if (options.length === 0) {
		return null;
	}

	return (
		<Group gap={6} role="group" aria-label="Filter by tag">
			<Chip.Group multiple value={value} onChange={onChange}>
				{shown.map((option) => (
					<TagFilterChip key={option.tag._id} option={option} />
				))}
			</Chip.Group>
			{(hiddenCount > 0 || expanded) && (
				<Button
					variant="dashed"
					size="compact-sm"
					radius="xl"
					onClick={() => setExpanded(!expanded)}
				>
					{expanded ? 'Fewer' : `+${hiddenCount} more`}
				</Button>
			)}
			{options.some((option) => option.selected) && (
				<Button variant="subtle" size="compact-sm" onClick={() => onChange([])}>
					Clear
				</Button>
			)}
		</Group>
	);
};
