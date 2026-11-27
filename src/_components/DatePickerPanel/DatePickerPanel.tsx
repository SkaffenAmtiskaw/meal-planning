import type { ReactElement } from 'react';

import { Stack } from '@mantine/core';

import type { DatePickerPanelProps } from './types';

import { DatePickerGrid } from '../DatePickerGrid';
import { TodayFooter } from './_components/TodayFooter/TodayFooter';

/**
 * The date picker's content: a month of days to pick from, and a Today button
 * when asked for. It only reports the pick, so its caller decides what a pick
 * does and whether the picker closes.
 */
export function DatePickerPanel({
	value,
	onChange,
	markedDates,
	withTodayFooter = false,
}: DatePickerPanelProps): ReactElement {
	return (
		<Stack gap="xs">
			<DatePickerGrid
				value={value}
				onChange={onChange}
				markedDates={markedDates}
			/>
			{withTodayFooter && <TodayFooter onPick={onChange} />}
		</Stack>
	);
}
