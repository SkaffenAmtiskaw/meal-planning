import type { ReactElement, Ref } from 'react';

import { Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';

import { AddMealForDayButton } from './AddMealForDayButton';
import { PhoneDayFrame } from './PhoneDayFrame';
import { PhoneDayHeader } from './PhoneDayHeader';
import { PhoneDayLabel } from './PhoneDayLabel';

import { useDayMeals } from '../../../_hooks/useCalendarMeals';
import { MealCard } from '../../Calendar/MealCard/MealCard';

interface PhoneDaySectionProps {
	ref?: Ref<HTMLDivElement>;
	date: DateTime;
	today: DateTime;
	plannerId: string;
}

// One day of the phone list, labelled with its full date: its header, then its meals.
export function PhoneDaySection({
	ref,
	date,
	today,
	plannerId,
}: PhoneDaySectionProps): ReactElement {
	const meals = useDayMeals(date);

	return (
		<PhoneDayFrame
			ref={ref}
			ariaLabel={formatDate(date, 'weekdayMonthDay')}
			header={
				<PhoneDayHeader
					label={
						<PhoneDayLabel date={date} isToday={date.hasSame(today, 'day')} />
					}
					addMealButton={<AddMealForDayButton date={date} />}
				/>
			}
		>
			{meals.length > 0 ? (
				meals.map((meal) => (
					<MealCard key={meal.id} meal={meal} plannerId={plannerId} />
				))
			) : (
				<Text size="sm" c="var(--text-muted)">
					No meals planned
				</Text>
			)}
		</PhoneDayFrame>
	);
}
