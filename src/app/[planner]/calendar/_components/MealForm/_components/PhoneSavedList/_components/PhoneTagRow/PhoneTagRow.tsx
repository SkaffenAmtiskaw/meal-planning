'use client';

import { useState } from 'react';

import { Group, ScrollArea } from '@mantine/core';

import type { TagFilterOption } from '../../../../_utils/types';
import { TagChips } from '../../../TagChips/TagChips';

type Props = {
	// The chips in order, as rankTagOptions gives them.
	options: TagFilterOption[];
	// The selected tags' ids, in pick order.
	value: string[];
	onChange: (tagIds: string[]) => void;
};

/**
 * The phone list's tag filter: the tag chips in one row that scrolls sideways.
 * Once expanded, it stays expanded until "Fewer", however the tags change.
 * Shows nothing when no tag would return anything.
 */
export const PhoneTagRow = ({ options, value, onChange }: Props) => {
	// Above the early return, so the row stays expanded while it has nothing to show.
	const [expanded, setExpanded] = useState(false);

	if (options.length === 0) {
		return null;
	}

	return (
		<ScrollArea
			scrollbars="x"
			type="auto"
			offsetScrollbars="x"
			// Mantine's content box stays the viewport's width, so the chips would overflow it: it never resizes, the scrollbar never hides, and "+N more" gets squeezed.
			styles={{ content: { width: 'max-content' } }}
		>
			<Group gap={6} wrap="nowrap" role="group" aria-label="Filter by tag">
				<TagChips
					options={options}
					value={value}
					onChange={onChange}
					expanded={expanded}
					onToggleExpanded={() => setExpanded(!expanded)}
				/>
			</Group>
		</ScrollArea>
	);
};
