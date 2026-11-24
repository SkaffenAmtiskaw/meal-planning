'use client';

import { Group } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';

import { SavedItemAction } from '../SavedItemAction/SavedItemAction';
import { SavedItemSummary } from '../SavedItemSummary/SavedItemSummary';

type Props = {
	item: SavedItem;
	added: boolean;
	onAdd: () => void;
};

// One saved recipe in the column: what it is, then its action.
export const SavedResultRow = ({ item, added, onAdd }: Props) => (
	<Group
		justify="space-between"
		align="center"
		wrap="nowrap"
		gap="sm"
		py="xs"
		data-testid="saved-result"
	>
		<SavedItemSummary item={item} />
		<SavedItemAction itemName={item.name} added={added} onAdd={onAdd} />
	</Group>
);
