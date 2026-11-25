import type { TagFilterOption } from './types';

// How many chips show at a time, selected ones included.
const CHIP_LIMIT = 6;

/**
 * The chips the tag filter shows, and how many sit behind "+N more". Every
 * selected chip shows, even past the limit, and unselected ones fill the rest
 * of it. Expanded, every chip shows.
 */
export const limitTagChips = (
	options: TagFilterOption[],
	expanded: boolean,
): { shown: TagFilterOption[]; hiddenCount: number } => {
	if (expanded) {
		return { shown: options, hiddenCount: 0 };
	}

	const selected = options.filter((option) => option.selected);
	const unselected = options.filter((option) => !option.selected);
	const room = Math.max(CHIP_LIMIT - selected.length, 0);

	return {
		shown: [...selected, ...unselected.slice(0, room)],
		hiddenCount: Math.max(unselected.length - room, 0),
	};
};
