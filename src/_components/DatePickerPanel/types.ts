export type DatePickerPanelProps = {
	// The selected date as an ISO date, or null when none is selected.
	value: string | null;
	// Called with the ISO date of the day picked.
	onChange: (date: string) => void;
	// ISO dates that get a dot under their number, such as the days with meals.
	markedDates?: string[];
	// Whether a Today button under the days picks today.
	withTodayFooter?: boolean;
};
