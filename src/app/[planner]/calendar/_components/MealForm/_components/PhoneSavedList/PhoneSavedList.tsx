'use client';

import { Fragment, useState } from 'react';

import { Box, Divider, Paper, Stack } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';

import type { SavedItem } from '@/_actions/library/types';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { phoneListRows } from '../../_utils/phoneListRows';
import { phoneListTitle } from '../../_utils/phoneListTitle';
import { AddAsNewDishRow } from '../AddAsNewDishRow/AddAsNewDishRow';
import { PhoneSavedResultRow } from '../PhoneSavedResultRow/PhoneSavedResultRow';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	// What's typed in the dish's name field.
	search: string;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	// The name field's area. A tap there leaves the list open, as a tap in the list does.
	fieldNode: HTMLElement | null;
	onUse: (item: SavedItem) => void;
	onClose: () => void;
};

/**
 * The saved recipes under a dish's name field on a phone, then a last row that
 * keeps what's typed as a new dish. It closes on a tap outside both the field
 * and the list.
 */
export const PhoneSavedList = ({
	search,
	linkedIds,
	fieldNode,
	onUse,
	onClose,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	const [listNode, setListNode] = useState<HTMLDivElement | null>(null);
	useClickOutside(onClose, null, [fieldNode, listNode]);

	const criteria = { search, tagIds: [] };
	const rows = phoneListRows(savedItems, criteria);

	return (
		<Paper ref={setListNode} withBorder mt="xs" px="sm" py="xs" bg="chalk.0">
			<Stack gap={0}>
				{rows.length > 0 && (
					<>
						<Box py="xs">
							<SectionLabel>{phoneListTitle(criteria)}</SectionLabel>
						</Box>
						{/* A line above each result and above the last row, as the design separates them. */}
						{rows.map((item) => (
							<Fragment key={item._id}>
								<Divider />
								<PhoneSavedResultRow
									item={item}
									added={linkedIds.has(item._id)}
									onUse={() => onUse(item)}
								/>
							</Fragment>
						))}
						<Divider />
					</>
				)}
				<AddAsNewDishRow text={search} onAdd={onClose} />
			</Stack>
		</Paper>
	);
};
