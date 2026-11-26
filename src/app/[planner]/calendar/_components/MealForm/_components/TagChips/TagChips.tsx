'use client';

import { Button, Chip } from '@mantine/core';

import { limitTagChips } from '../../_utils/limitTagChips';
import type { TagFilterOption } from '../../_utils/types';
import { TagFilterChip } from '../TagFilterChip/TagFilterChip';

type Props = {
	// The chips in order, as rankTagOptions gives them.
	options: TagFilterOption[];
	// The selected tags' ids, in pick order.
	value: string[];
	onChange: (tagIds: string[]) => void;
	// True while every chip shows. The caller holds it, so it outlives a moment with no chips.
	expanded: boolean;
	onToggleExpanded: () => void;
};

/**
 * The tag filter's chips: six at a time behind "+N more", which shows them all
 * and turns into "Fewer". Chip.Group adds each pick to the end of the value, so
 * it keeps pick order. It has no layout of its own, so each caller places it in
 * its own row.
 */
export const TagChips = ({
	options,
	value,
	onChange,
	expanded,
	onToggleExpanded,
}: Props) => {
	const { shown, hiddenCount } = limitTagChips(options, expanded);

	return (
		<>
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
					onClick={onToggleExpanded}
				>
					{expanded ? 'Fewer' : `+${hiddenCount} more`}
				</Button>
			)}
		</>
	);
};
