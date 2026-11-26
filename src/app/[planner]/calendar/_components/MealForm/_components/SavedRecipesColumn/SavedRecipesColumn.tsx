'use client';

import type { Ref } from 'react';

import { ScrollArea, Stack } from '@mantine/core';

import type { SavedItem } from '@/_actions/library/types';
import { useListHighlight } from '@/_hooks';

import classes from './SavedRecipesColumn.module.css';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';
import { useSavedItemCriteria } from '../../_hooks/useSavedItemCriteria';
import { narrowSavedItems } from '../../_utils/narrowSavedItems';
import { savedItemAction } from '../../_utils/savedItemAction';
import type { DishDraft } from '../../types';
import { LinkModeBanner } from '../LinkModeBanner/LinkModeBanner';
import { SavedKeyHint } from '../SavedKeyHint/SavedKeyHint';
import { SavedResultList } from '../SavedResultList/SavedResultList';
import { SavedSearchInput } from '../SavedSearchInput/SavedSearchInput';
import { SectionLabel } from '../SectionLabel/SectionLabel';
import { TagFilter } from '../TagFilter/TagFilter';

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
 * dish is being linked, the search, the tag filter, the key hint, then the
 * planner's saved recipes that match both, which scroll on their own. One
 * result is highlighted, moved by the search's ↓/↑ and by the mouse, and run
 * by Enter. It goes back to the first result whenever the search or the tags
 * change. The DOM order is the Tab order. The tag filter stays mounted as
 * linking starts and ends, so an expanded row stays expanded.
 */
export const SavedRecipesColumn = ({
	linkingDish,
	searchRef,
	linkedIds,
	onCancelLinking,
	onPick,
}: Props) => {
	const savedItems = usePlannerSavedItems();
	const [criteria, { setSearch, setTagIds }] =
		useSavedItemCriteria(linkingDish);
	const { results, tagOptions } = narrowSavedItems(savedItems, criteria);
	const linking = linkingDish !== null;
	// One string, since a new tag array each render would reset the highlight every render.
	const [highlighted, { moveNext, movePrevious, highlight, itemRef }] =
		useListHighlight({
			count: results.length,
			resetKey: JSON.stringify([criteria.search, criteria.tagIds]),
		});

	// Enter does what the highlighted result's button does, which is nothing once it's on the meal.
	const runHighlighted = () => {
		const item = highlighted === null ? undefined : results[highlighted];
		if (
			item &&
			savedItemAction({ added: linkedIds.has(item._id), linking }) !== 'added'
		) {
			onPick(item);
		}
	};

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
				linking={linking}
				onMoveDown={moveNext}
				onMoveUp={movePrevious}
				onRun={runHighlighted}
			/>
			<TagFilter
				options={tagOptions}
				value={criteria.tagIds}
				onChange={setTagIds}
			/>
			<SavedKeyHint linking={linking} />
			<ScrollArea className={classes.results} data-testid="saved-results">
				<div className={classes.resultsContent}>
					<SavedResultList
						results={results}
						hasSavedItems={savedItems.length > 0}
						linkedIds={linkedIds}
						linking={linking}
						highlightedIndex={highlighted}
						onPick={onPick}
						onHover={highlight}
						itemRef={itemRef}
					/>
				</div>
			</ScrollArea>
		</Stack>
	);
};
