'use client';

import type { ReactNode } from 'react';

import { Box, Paper, ScrollArea, Stack } from '@mantine/core';

import { useIsMobile } from '@/_hooks';

import classes from './MealFormLayout.module.css';

import { SectionLabel } from '../SectionLabel/SectionLabel';

type Props = {
	alert: ReactNode;
	meal: ReactNode;
	dishes: ReactNode;
	footer: ReactNode;
};

/**
 * Lays out the form's parts. Desktop: the Meal, Dishes and Saved recipes columns,
 * with only the dishes scrolling, and the footer below. Phone: one scrolling
 * column, with the footer stuck to the bottom. The alert sits above the dishes on
 * both. The DOM order is the Tab order.
 */
export const MealFormLayout = ({ alert, meal, dishes, footer }: Props) => {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Box className={classes.root}>
				<ScrollArea className={classes.fill} bg="chalk.0">
					<Stack gap="md" p="md">
						{alert}
						<Paper withBorder p="md" data-testid="meal-column">
							{meal}
						</Paper>
						<Box data-testid="dishes-column">{dishes}</Box>
					</Stack>
				</ScrollArea>
				<Box className={classes.footer} p="md" data-testid="footer">
					{footer}
				</Box>
			</Box>
		);
	}

	return (
		<Box className={classes.root}>
			<Box className={classes.columns}>
				<Stack
					className={classes.mealColumn}
					bg="chalk.0"
					gap="sm"
					p="lg"
					data-testid="meal-column"
				>
					<SectionLabel>Meal</SectionLabel>
					{meal}
				</Stack>
				<ScrollArea className={classes.fill} data-testid="dishes-column">
					<Stack gap="md" p="lg">
						{alert}
						{dishes}
					</Stack>
				</ScrollArea>
				<Stack
					className={classes.savedColumn}
					bg="chalk.0"
					p="lg"
					data-testid="saved-column"
				>
					<SectionLabel>Saved recipes</SectionLabel>
				</Stack>
			</Box>
			<Box className={classes.footer} px="lg" py="md" data-testid="footer">
				{footer}
			</Box>
		</Box>
	);
};
