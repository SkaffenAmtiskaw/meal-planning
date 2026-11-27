import type { ReactElement, Ref } from 'react';

import { Stack, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';

import { DayAddButton } from './DayAddButton';
import { PhoneDayHeader } from './PhoneDayHeader';
import styles from './PhoneDaySection.module.css';

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
		<Stack
			ref={ref}
			component="section"
			aria-label={formatDate(date, 'weekdayMonthDay')}
			className={styles.section}
			gap="xs"
			p="sm"
		>
			<PhoneDayHeader
				date={date}
				isToday={date.hasSame(today, 'day')}
				addMealButton={<DayAddButton date={date} />}
			/>
			{meals.length > 0 ? (
				meals.map((meal) => (
					<MealCard key={meal.id} meal={meal} plannerId={plannerId} />
				))
			) : (
				<Text size="sm" c="var(--text-muted)">
					No meals planned
				</Text>
			)}
		</Stack>
	);
}
