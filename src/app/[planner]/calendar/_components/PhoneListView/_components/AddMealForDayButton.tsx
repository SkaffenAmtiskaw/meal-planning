'use client';

import type { ReactElement } from 'react';

import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import type { DateTime } from 'luxon';

import { formatDate } from '@/_utils/formatDate';
import { useCanWrite } from '@/app/[planner]/_components';

import styles from './AddMealForDayButton.module.css';

import { useCalendarModal } from '../../CalendarModal';

interface AddMealForDayButtonProps {
	date: DateTime;
}

// A phone list day's + button, which opens Add Meal with its day filled in. Hidden from read-only users.
export function AddMealForDayButton({
	date,
}: AddMealForDayButtonProps): ReactElement | null {
	const canWrite = useCanWrite();
	const { open } = useCalendarModal();

	if (!canWrite) {
		return null;
	}

	return (
		<ActionIcon
			className={styles.button}
			variant="default"
			size={28}
			radius="xl"
			aria-label={`Add meal for ${formatDate(date, 'weekdayMonthDay')}`}
			onClick={() =>
				open('add_meal', { initialDate: date.toISODate() ?? undefined })
			}
		>
			<IconPlus size={14} />
		</ActionIcon>
	);
}
