'use client';

import type { Ref } from 'react';

import { ScrollArea, Stack } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';

import classes from './SavedRecipesColumn.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useSavedItemCriteria } from '../../_hooks/useSavedItemCriteria';
import { filterSavedItems } from '../../_utils/filterSavedItems';
import { orderSavedItems } from '../../_utils/orderSavedItems';
import type { DishDraft } from '../../types';
import { LinkModeBanner } from '../LinkModeBanner/LinkModeBanner';
import { SavedResultList } from '../SavedResultList/SavedResultList';
import { SavedSearchInput } from '../SavedSearchInput/SavedSearchInput';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	// The dish being linked, or null outside link mode. The search starts over whenever it changes.
	linkingDish: DishDraft | null;
	searchRef?: Ref<HTMLInputElement>;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	onCancelLinking: () => void;
	// Adds the picked recipe as a dish, or links it while a dish is being linked.
	onPick: (item: SavedItem) => void;
};

/**
 * The desktop Saved recipes column: its label, the link-mode banner while a
 * dish is being linked, the search, then the planner's saved recipes that match
 * it, which scroll on their own. The DOM order is the Tab order.
 */
export const SavedRecipesColumn = ({
	linkingDish,
	searchRef,
	linkedIds,
	onCancelLinking,
	onPick,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	const [criteria, { setSearch }] = useSavedItemCriteria(linkingDish);
	const results = filterSavedItems(orderSavedItems(savedItems), criteria);
	const linking = linkingDish !== null;

	return (
		<Stack gap="sm" className={classes.root}>
			<SectionLabel>Saved recipes</SectionLabel>
			{linking && (
				<LinkModeBanner
					dishName={linkingDish.name}
					onCancel={onCancelLinking}
				/>
			)}
			<SavedSearchInput
				ref={searchRef}
				value={criteria.search}
				onChange={setSearch}
			/>
			<ScrollArea className={classes.results} data-testid="saved-results">
				<div className={classes.resultsContent}>
					<SavedResultList
						results={results}
						hasSavedItems={savedItems.length > 0}
						linkedIds={linkedIds}
						linking={linking}
						onPick={onPick}
					/>
				</div>
			</ScrollArea>
		</Stack>
	);
};
