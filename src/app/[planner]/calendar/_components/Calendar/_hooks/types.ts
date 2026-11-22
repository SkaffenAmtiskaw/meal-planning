export interface RovingGridFocusDayProps {
	tabIndex: 0 | -1;
	onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
	ref: (el: HTMLElement | null) => void;
}
