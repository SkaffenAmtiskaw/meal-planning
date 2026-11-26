'use client';

import { Stack, Text } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';

import { SavedResultRow } from '../SavedResultRow/SavedResultRow';

type Props = {
	// The saved recipes left after the search, in the order to show them.
	results: SavedItem[];
	// False when the planner has no saved recipes at all, rather than none that match.
	hasSavedItems: boolean;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	// A dish is being linked, so picking a result links it rather than adding a dish.
	linking: boolean;
	// The result the keys and the mouse point at, or null with none.
	highlightedIndex: number | null;
	onPick: (item: SavedItem) => void;
	onHover: (index: number) => void;
	// The ref for each result's row, so it can be scrolled into view.
	itemRef: (index: number) => (element: HTMLElement | null) => void;
};

/**
 * The column's results, or a message when there are none: one pointing to the
 * Recipes page when the planner has no saved recipes, or one saying nothing
 * matches.
 */
export const SavedResultList = ({
	results,
	hasSavedItems,
	linkedIds,
	linking,
	highlightedIndex,
	onPick,
	onHover,
	itemRef,
}: Props) => {
	if (results.length === 0) {
		return (
			<Text size="sm" c="var(--text-muted)">
				{hasSavedItems
					? 'No saved recipes match.'
					: 'No saved recipes yet. Add them on the Recipes page.'}
			</Text>
		);
	}

	return (
		<Stack gap={0}>
			{results.map((item, index) => (
				<SavedResultRow
					key={item._id}
					ref={itemRef(index)}
					item={item}
					added={linkedIds.has(item._id)}
					linking={linking}
					highlighted={index === highlightedIndex}
					onPick={() => onPick(item)}
					onHover={() => onHover(index)}
				/>
			))}
		</Stack>
	);
};
