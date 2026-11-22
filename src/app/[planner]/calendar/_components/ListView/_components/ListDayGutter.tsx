import type { ReactElement, ReactNode } from 'react';

import { Badge, Box, Flex, Text } from '@mantine/core';

import type { DateTime } from 'luxon';

import styles from './ListDayGutter.module.css';

interface ListDayGutterProps {
	date: DateTime;
	isToday: boolean;
	/** Shown beside the date, such as the add-meal button. */
	addMealButton?: ReactNode;
}

export function ListDayGutter({
	date,
	isToday,
	addMealButton,
}: ListDayGutterProps): ReactElement {
	const isFirstOfMonth = date.day === 1;

	return (
		<Box className={styles.gutter}>
			<Box className={styles.gutterContent}>
				<Text
					className={styles.gutterText}
					size="xs"
					fw={700}
					c="navy.4"
					tt="uppercase"
				>
					{date.toFormat('ccc').toUpperCase()}
				</Text>
				<Flex className={styles.dateLine} align="center" gap={4}>
					{isToday ? (
						<Badge circle color="ember" size="lg">
							{date.day}
						</Badge>
					) : (
						<Text size="xl" fw={500}>
							{date.day}
						</Text>
					)}
				</Flex>
				{isFirstOfMonth && (
					<Text
						className={styles.gutterText}
						size="xs"
						fw={600}
						c="ember.5"
						tt="uppercase"
					>
						{date.toFormat('MMM').toUpperCase()}
					</Text>
				)}
				{addMealButton}
			</Box>
		</Box>
	);
}
