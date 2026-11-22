import type { ReactElement, ReactNode } from 'react';

import { Box, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import { NumberMark } from '@/_components';

import styles from './ListDayGutter.module.css';

interface ListDayGutterProps {
	date: DateTime;
	isToday: boolean;
	/** Shown beside the date, such as the add-meal button. */
	addMealButton?: ReactNode;
}

function GutterLabel({ children }: { children: ReactNode }): ReactElement {
	return (
		<Text
			className={styles.dateColumn}
			ta="right"
			size="xs"
			fw={700}
			c="navy.4"
			tt="uppercase"
		>
			{children}
		</Text>
	);
}

export function ListDayGutter({
	date,
	isToday,
	addMealButton,
}: ListDayGutterProps): ReactElement {
	return (
		<Box
			className={styles.gutter}
			pos="sticky"
			top={8}
			w={82}
			miw={82}
			maw={82}
			pr={12}
		>
			<Box className={styles.gutterContent}>
				<GutterLabel>{date.toFormat('ccc')}</GutterLabel>
				<Box className={styles.dateColumn} ta="right">
					<NumberMark
						size="xl"
						ring={isToday}
						aria-current={isToday ? 'date' : undefined}
					>
						{date.day}
					</NumberMark>
				</Box>
				{date.day === 1 && <GutterLabel>{date.toFormat('MMM')}</GutterLabel>}
				{addMealButton}
			</Box>
		</Box>
	);
}
