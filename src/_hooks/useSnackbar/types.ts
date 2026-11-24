/** One message for the confirmation bar. */
export interface SnackbarMessage {
	message: string;
	// Shows Undo; the caller says what Undo does.
	onUndo?: () => void;
}

export interface SnackbarContextValue {
	/**
	 * Shows the bar for 4 seconds, or 6 with Undo. A new message replaces the
	 * one showing.
	 */
	show: (message: SnackbarMessage) => void;
}
