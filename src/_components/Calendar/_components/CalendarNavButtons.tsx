'use client';

import type { ReactElement } from 'react';

import { ActionIcon, Button } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { ActionIconProps, ButtonProps } from '@mantine/core';

import { PillButton, type PillButtonProps } from '@/_components/PillButton';

import { useCalendarContext } from '../CalendarContext';

export function CalendarTodayButton(props: ButtonProps): ReactElement {
	const { goToToday } = useCalendarContext();

	return (
		<Button variant="default" onClick={goToToday} {...props}>
			Today
		</Button>
	);
}

export function CalendarTodayPillButton(props: PillButtonProps): ReactElement {
	const { goToToday } = useCalendarContext();

	return (
		<PillButton variant="outline" size="md" onClick={goToToday} {...props}>
			Today
		</PillButton>
	);
}

export function CalendarPreviousButton(props: ActionIconProps): ReactElement {
	const { goToPrevious } = useCalendarContext();

	return (
		<ActionIcon
			variant="subtle"
			aria-label="Previous"
			onClick={goToPrevious}
			{...props}
		>
			<IconChevronLeft />
		</ActionIcon>
	);
}

export function CalendarNextButton(props: ActionIconProps): ReactElement {
	const { goToNext } = useCalendarContext();

	return (
		<ActionIcon
			variant="subtle"
			aria-label="Next"
			onClick={goToNext}
			{...props}
		>
			<IconChevronRight />
		</ActionIcon>
	);
}
