export type ListHighlightHandlers = {
	moveNext: () => void;
	movePrevious: () => void;
	// Highlights an item without scrolling, as for the item under the pointer.
	highlight: (index: number) => void;
	// The ref for each item's element, so a move can scroll it into view.
	itemRef: (index: number) => (element: HTMLElement | null) => void;
};
