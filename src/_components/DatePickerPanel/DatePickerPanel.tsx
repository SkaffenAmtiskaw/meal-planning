import type { ReactElement } from 'react';

import type { DatePickerPanelProps } from './types';

import { DatePickerGrid } from '../DatePickerGrid';

/**
 * The date picker's content: a month of days to pick from. It only reports the
 * pick, so its caller decides what a pick does and whether the picker closes.
 */
export function DatePickerPanel({
	value,
	onChange,
	markedDates,
}: DatePickerPanelProps): ReactElement {
	return (
		<DatePickerGrid
			value={value}
			onChange={onChange}
			markedDates={markedDates}
		/>
	);
}
