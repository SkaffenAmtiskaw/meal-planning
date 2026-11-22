import type { ReactElement } from 'react';

import { Box, Center, Group, Stack, UnstyledButton } from '@mantine/core';

import type { DateTime } from 'luxon';

import { NumberMark } from '@/_components';
import focusClasses from '@/_theme/focus.module.css';
import { formatDate } from '@/_utils/formatDate';

import type { MobileMonthGridMeal } from './types';
import styles from './MobileMonthGridDayCell.module.css';

import type { RovingGridFocusDayProps } from '../_hooks/types';

const MAX_MEAL_DOTS = 3;

interface MobileMonthGridDayCellProps {
	day: DateTime;
	isToday: boolean;
	isSelected: boolean;
	isCurrentMonth: boolean;
	meals: MobileMonthGridMeal[];
	dayProps: RovingGridFocusDayProps;
	onSelect: () => void;
}

export function MobileMonthGridDayCell({
	day,
	isToday,
	isSelected,
	isCurrentMonth,
	meals,
	dayProps,
	onSelect,
}: MobileMonthGridDayCellProps): ReactElement {
	return (
		<UnstyledButton
			data-testid="mobile-day-cell"
			className={`${focusClasses.focusRing} ${styles.dayCell}`}
			aria-label={`${formatDate(day, 'monthDay')}, ${meals.length} meals`}
			aria-pressed={isSelected}
			aria-current={isToday ? 'date' : undefined}
			{...dayProps}
			onClick={onSelect}
		>
			<Stack gap={3} align="center">
				<Center>
					<NumberMark
						ring={isToday}
						filled={isSelected}
						muted={!isCurrentMonth}
					>
						{day.day}
					</NumberMark>
				</Center>

				<Group
					gap={4}
					justify="center"
					wrap="nowrap"
					className={styles.dots}
					aria-hidden
				>
					{meals.slice(0, MAX_MEAL_DOTS).map((meal) => (
						<Box
							key={meal.id}
							className={styles.dot}
							// The dot takes its meal's tag color, which is data rather than a theme color.
							style={{ backgroundColor: meal.color }}
							aria-hidden
						/>
					))}
				</Group>
			</Stack>
		</UnstyledButton>
	);
}
