import type { ReactElement } from 'react';

import { ActionIcon, Flex, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import styles from './DayRow.module.css';

export type ListViewAddMealTriggerVariant = 'gutter' | 'ghost';

export interface ListViewAddMealTriggerProps {
	variant: ListViewAddMealTriggerVariant;
	onClick: () => void;
}

export function ListViewAddMealTrigger({
	variant,
	onClick,
}: ListViewAddMealTriggerProps): ReactElement {
	if (variant === 'gutter') {
		return (
			<ActionIcon
				className={styles.addButton}
				variant="default"
				size={22}
				radius="xl"
				color="forest"
				onClick={onClick}
			>
				<IconPlus size={14} />
			</ActionIcon>
		);
	}

	return (
		<Flex className={styles.ghostRow} align="center" gap={8} onClick={onClick}>
			<IconPlus size={16} color="var(--mantine-color-forest-9)" />
			<Text size="sm" fw={600} c="forest">
				Add meal
			</Text>
		</Flex>
	);
}
