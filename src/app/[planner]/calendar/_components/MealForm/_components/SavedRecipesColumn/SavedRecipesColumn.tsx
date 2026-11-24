'use client';

import { ScrollArea, Stack } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';

import classes from './SavedRecipesColumn.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { filterSavedItems } from '../../_utils/filterSavedItems';
import { orderSavedItems } from '../../_utils/orderSavedItems';
import { SavedResultList } from '../SavedResultList/SavedResultList';
import { SavedSearchInput } from '../SavedSearchInput/SavedSearchInput';
import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	search: string;
	onSearchChange: (search: string) => void;
	// The saved recipes already on the meal.
	linkedIds: ReadonlySet<string>;
	onAdd: (item: SavedItem) => void;
};

/**
 * The desktop Saved recipes column: its label, the search, then the planner's
 * saved recipes that match it, which scroll on their own. The DOM order is the
 * Tab order.
 */
export const SavedRecipesColumn = ({
	search,
	onSearchChange,
	linkedIds,
	onAdd,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	const results = filterSavedItems(orderSavedItems(savedItems), { search });

	return (
		<Stack gap="sm" className={classes.root}>
			<SectionLabel>Saved recipes</SectionLabel>
			<SavedSearchInput value={search} onChange={onSearchChange} />
			<ScrollArea className={classes.results} data-testid="saved-results">
				<div className={classes.resultsContent}>
					<SavedResultList
						results={results}
						hasSavedItems={savedItems.length > 0}
						linkedIds={linkedIds}
						onAdd={onAdd}
					/>
				</div>
			</ScrollArea>
		</Stack>
	);
};
