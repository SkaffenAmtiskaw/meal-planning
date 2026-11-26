'use client';

import type { ReactElement } from 'react';

import { IconCalendar } from '@tabler/icons-react';

import { DateFieldTrigger, DatePickerPopover } from '@/_components';
import { formatDate } from '@/_utils/formatDate';

import { useMealDates } from '../../../../_hooks/useCalendarMeals';

type Props = {
	// An ISO date, or '' while the meal has no date.
	value: string;
	onChange: (date: string) => void;
};

/**
 * The meal's Date field: a button showing the short date, which opens the
 * date picker with meal dots and a Today button.
 */
export function MealDateField({ value, onChange }: Props): ReactElement {
	const mealDates = useMealDates();

	return (
		<DatePickerPopover
			value={value === '' ? null : value}
			onChange={onChange}
			markedDates={mealDates}
			withTodayFooter
			sheetTitle="Choose day"
			renderTrigger={({ onClick }) => (
				<DateFieldTrigger
					label="Date"
					withAsterisk
					leftSection={<IconCalendar size={16} />}
					onClick={onClick}
				>
					{value !== '' && formatDate(value, 'shortWeekdayMonthDay')}
				</DateFieldTrigger>
			)}
		/>
	);
}
