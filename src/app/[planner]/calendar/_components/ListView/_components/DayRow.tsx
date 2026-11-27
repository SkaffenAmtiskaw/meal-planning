'use client';

import type { ReactElement } from 'react';

import { Box, Flex, Stack } from '@mantine/core';

import type { DateTime } from 'luxon';

import { useCanWrite } from '@/app/[planner]/_components';

import { AddMealGutterButton } from './AddMealGutterButton';
import { AddMealRow } from './AddMealRow';
import { ListDayGutter } from './ListDayGutter';
import { MealCardWithDragHandle } from './MealCardWithDragHandle';
import styles from './DayRow.module.css';

import { useDayMeals } from '../../../_hooks/useCalendarMeals';
import { useCalendarModal } from '../../CalendarModal';

interface DayRowProps {
	date: DateTime;
	today: DateTime;
	plannerId: string;
}

export function DayRow({ date, today, plannerId }: DayRowProps): ReactElement {
	const meals = useDayMeals(date);
	const canWrite = useCanWrite();
	const { open } = useCalendarModal();
	const isToday = date.hasSame(today, 'day');
	const hasMeals = meals.length > 0;

	const handleAddMeal = (): void => {
		open('add_meal', { initialDate: date.toISODate() ?? undefined });
	};

	return (
		<Flex
			className={styles.row}
			py={14}
			data-iso={date.toISODate()}
			// AddMealGutterButton's stylesheet shows the button while this row is hovered or focused.
			data-day-row
		>
			<ListDayGutter
				date={date}
				isToday={isToday}
				addMealButton={
					canWrite && <AddMealGutterButton onClick={handleAddMeal} />
				}
			/>
			<Box className={styles.meals} flex={1} miw={0} mih={40} pl={14}>
				{(hasMeals || canWrite) && (
					<Stack gap="xs">
						{hasMeals ? (
							meals.map((meal) => (
								<MealCardWithDragHandle
									key={meal.id}
									meal={meal}
									plannerId={plannerId}
								/>
							))
						) : (
							<AddMealRow onClick={handleAddMeal} />
						)}
					</Stack>
				)}
			</Box>
		</Flex>
	);
}
