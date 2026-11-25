'use client';

import { useState } from 'react';

import { Button, Group } from '@mantine/core';

import type { TagFilterOption } from '../../_utils/types';
import { TagChips } from '../TagChips/TagChips';

type Props = {
	// The chips in order, as rankTagOptions gives them.
	options: TagFilterOption[];
	// The selected tags' ids, in pick order.
	value: string[];
	onChange: (tagIds: string[]) => void;
};

/**
 * The desktop tag filter: the tag chips in a row that wraps, and a Clear while
 * any tag is selected. Once expanded, it stays expanded until "Fewer", however
 * the tags change. Shows nothing when no tag would return anything.
 */
export const TagFilter = ({ options, value, onChange }: Props) => {
	// Above the early return, so the row stays expanded while it has nothing to show.
	const [expanded, setExpanded] = useState(false);

	if (options.length === 0) {
		return null;
	}

	return (
		<Group gap={6} role="group" aria-label="Filter by tag">
			<TagChips
				options={options}
				value={value}
				onChange={onChange}
				expanded={expanded}
				onToggleExpanded={() => setExpanded(!expanded)}
			/>
			{options.some((option) => option.selected) && (
				<Button variant="subtle" size="compact-sm" onClick={() => onChange([])}>
					Clear
				</Button>
			)}
		</Group>
	);
};
