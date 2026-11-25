import type { SavedItem } from '@/_actions/library/types';
import type { TagInterface } from '@/_models/types';

import type { TagFilterOption } from './types';

type Input = {
	// The items whose tags are counted, such as the current results.
	countOver: SavedItem[];
	// Every saved item in the planner, which breaks ties and finds the selected tags.
	savedItems: SavedItem[];
	// The selected tags' ids, in pick order.
	selectedIds: string[];
};

// How many of the items carry each tag, by tag id, with the tag itself.
const tally = (items: SavedItem[]) => {
	const counts = new Map<string, { tag: TagInterface; count: number }>();
	for (const { tags } of items) {
		for (const tag of tags) {
			const entry = counts.get(tag._id) ?? { tag, count: 0 };
			entry.count++;
			counts.set(tag._id, entry);
		}
	}
	return counts;
};

/**
 * The tag filter's chips, in order. The selected tags come first, in pick order
 * and with no count, kept even when nothing carries them; an id no saved item
 * carries any more is dropped. Then the unselected tags that a counted item
 * carries, most carried first, then by how many of the planner's saved items
 * carry them, then by name, ignoring case.
 */
export const rankTagOptions = ({
	countOver,
	savedItems,
	selectedIds,
}: Input): TagFilterOption[] => {
	const plannerCounts = tally(savedItems);

	const selected = selectedIds.flatMap((id) => {
		const entry = plannerCounts.get(id);
		return entry ? [{ tag: entry.tag, selected: true, count: null }] : [];
	});

	const unselected = [...tally(countOver).values()]
		.filter(({ tag }) => !selectedIds.includes(tag._id))
		.toSorted(
			(a, b) =>
				b.count - a.count ||
				(plannerCounts.get(b.tag._id)?.count ?? 0) -
					(plannerCounts.get(a.tag._id)?.count ?? 0) ||
				a.tag.name.localeCompare(b.tag.name, undefined, {
					sensitivity: 'base',
				}),
		)
		.map(({ tag, count }) => ({ tag, selected: false, count }));

	return [...selected, ...unselected];
};
