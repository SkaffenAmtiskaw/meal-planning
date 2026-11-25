'use client';

import { Fragment, useState } from 'react';

import { Divider, Paper, Stack } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';

import type { SavedItem } from '@/_actions/library/types';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { narrowSavedItems } from '../../_utils/narrowSavedItems';
import { AddAsNewDishRow } from '../AddAsNewDishRow/AddAsNewDishRow';
import { PhoneSavedResultRow } from '../PhoneSavedResultRow/PhoneSavedResultRow';
import { PhoneSavedListHeader } from './_components/PhoneSavedListHeader/PhoneSavedListHeader';
import { PhoneTagRow } from './_components/PhoneTagRow/PhoneTagRow';
import { phoneListRows } from './_utils/phoneListRows';
import { phoneListTitle } from './_utils/phoneListTitle';

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
 * The saved recipes under a dish's name field on a phone, narrowed by what's
 * typed and the selected tags, then a last row that keeps what's typed as a
 * new dish. It closes on a tap outside both the field and the list.
 */
export const PhoneSavedList = ({
	search,
	linkedIds,
	fieldNode,
	onUse,
	onClose,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	// The selected tags' ids, in pick order. DishRow keys this list on each open, so every open starts with none.
	const [tagIds, setTagIds] = useState<string[]>([]);
	const [listNode, setListNode] = useState<HTMLDivElement | null>(null);
	useClickOutside(onClose, null, [fieldNode, listNode]);

	const criteria = { search, tagIds };
	const { results, tagOptions } = narrowSavedItems(savedItems, criteria);
	const rows = phoneListRows(results, criteria);
	const selectedTagNames = tagOptions
		.filter((option) => option.selected)
		.map((option) => option.tag.name);
	// With a tag selected, the title and chips stay even when nothing matches, so the tag can be cleared.
	const showHeader = rows.length > 0 || tagIds.length > 0;

	return (
		<Paper ref={setListNode} withBorder mt="xs" px="sm" py="xs" bg="chalk.0">
			<Stack gap={0}>
				{showHeader && (
					<>
						<PhoneSavedListHeader
							title={phoneListTitle({ selectedTagNames })}
							onClearTags={tagIds.length > 0 ? () => setTagIds([]) : undefined}
						/>
						<PhoneTagRow
							options={tagOptions}
							value={tagIds}
							onChange={setTagIds}
						/>
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
