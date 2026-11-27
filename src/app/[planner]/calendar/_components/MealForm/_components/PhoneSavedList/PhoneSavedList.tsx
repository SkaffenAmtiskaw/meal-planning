'use client';

import { Fragment, useState } from 'react';

import { Divider, Paper, Stack } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useMealDishes } from '../../../_hooks/useMealForm';
import { useDish } from '../../_hooks/useDish';
import { useDishLinkingContext } from '../../_hooks/useDishLinking';
import { narrowSavedItems } from '../../_utils/narrowSavedItems';
import { AddAsNewDishRow } from '../AddAsNewDishRow/AddAsNewDishRow';
import { PhoneSavedResultRow } from '../PhoneSavedResultRow/PhoneSavedResultRow';
import { PhoneSavedListHeader } from './_components/PhoneSavedListHeader/PhoneSavedListHeader';
import { PhoneTagRow } from './_components/PhoneTagRow/PhoneTagRow';
import { phoneListRows } from './_utils/phoneListRows';
import { phoneListTitle } from './_utils/phoneListTitle';

type Props = {
	// The name field's area. A tap there leaves the list open, as a tap in the list does.
	fieldNode: HTMLElement | null;
};

/**
 * The saved recipes under a dish's name field on a phone, narrowed by what's
 * typed in it and the selected tags, then a last row that keeps what's typed as
 * a new dish. It closes on a tap outside both the field and the list. Using a
 * recipe gives the dish its name and links to it.
 */
export const PhoneSavedList = ({ fieldNode }: Props) => {
	const { dish } = useDish();
	const { linkedIds } = useMealDishes();
	const { chooseFromList, closeList } = useDishLinkingContext();
	const search = dish.name;
	const savedItems = usePlannerSavedItems();
	// The selected tags' ids, in pick order. DishRow keys this list on each open, so every open starts with none.
	const [tagIds, setTagIds] = useState<string[]>([]);
	const [listNode, setListNode] = useState<HTMLDivElement | null>(null);
	useClickOutside(closeList, null, [fieldNode, listNode]);

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
							title={phoneListTitle({ search, selectedTagNames, rows })}
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
									onUse={() => chooseFromList(dish.key, item)}
								/>
							</Fragment>
						))}
						<Divider />
					</>
				)}
				<AddAsNewDishRow text={search} onAdd={closeList} />
			</Stack>
		</Paper>
	);
};
