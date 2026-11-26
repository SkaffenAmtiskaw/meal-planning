/**
 * What a key press in the Saved recipes search does: move the highlight, run
 * the highlighted result, clear the search, pass Esc on to the modal or link
 * mode, or ignore it and let the field handle it as usual.
 */
export type SearchKeyIntent =
	| 'moveDown'
	| 'moveUp'
	| 'run'
	| 'clear'
	| 'pass'
	| 'ignore';

/**
 * Turns a key press in the Saved recipes search into what it does. Esc clears
 * a search with text, but outside that case it's passed on: with an empty
 * search the modal closes, and while linking link mode ends. Keys pressed
 * while an input method is composing belong to the input method.
 */
export const searchKeyIntent = (
	event: { key: string; isComposing: boolean },
	{ hasText, linking }: { hasText: boolean; linking: boolean },
): SearchKeyIntent => {
	if (event.isComposing) {
		return 'ignore';
	}
	switch (event.key) {
		case 'ArrowDown':
			return 'moveDown';
		case 'ArrowUp':
			return 'moveUp';
		case 'Enter':
			return 'run';
		case 'Escape':
			return hasText && !linking ? 'clear' : 'pass';
		default:
			return 'ignore';
	}
};
