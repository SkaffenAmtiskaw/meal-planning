'use client';

import type { Ref } from 'react';

import { Group } from '@mantine/core';

import clsx from 'clsx';

import type { SavedItem } from '@/_actions/library/types';

import classes from './SavedResultRow.module.css';

import { SavedItemAction } from '../SavedItemAction/SavedItemAction';
import { SavedItemSummary } from '../SavedItemSummary/SavedItemSummary';

type Props = {
	item: SavedItem;
	added: boolean;
	linking: boolean;
	// The row the keys and the mouse point at, which Enter in the search runs.
	highlighted: boolean;
	onPick: () => void;
	onHover: () => void;
	// So the row can be scrolled into view when the keys move to it.
	ref?: Ref<HTMLDivElement>;
};

/**
 * One saved recipe in the column: what it is, then its action. Hover is
 * reported as the mouse moves, not as it enters, so a list scrolling under a
 * still mouse doesn't take the highlight back from the keys.
 */
export const SavedResultRow = ({
	item,
	added,
	linking,
	highlighted,
	onPick,
	onHover,
	ref,
}: Props) => (
	<Group
		ref={ref}
		justify="space-between"
		align="center"
		wrap="nowrap"
		gap="sm"
		py="xs"
		className={clsx(classes.root, highlighted && classes.highlighted)}
		onMouseMove={onHover}
		data-testid="saved-result"
	>
		<SavedItemSummary item={item} />
		<SavedItemAction
			itemName={item.name}
			added={added}
			linking={linking}
			onPick={onPick}
		/>
	</Group>
);
