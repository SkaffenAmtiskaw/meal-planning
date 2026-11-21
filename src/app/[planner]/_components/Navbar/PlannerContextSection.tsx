'use client';

import Link from 'next/link';

import { Menu, Text, UnstyledButton } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import type { PlannerItem } from './types';
import styles from './PlannerContextSection.module.css';

type Props = {
	currentId: string;
	planners: PlannerItem[];
};

export const PlannerContextSection = ({
	currentId,
	planners,
}: Props): React.JSX.Element => {
	const currentPlanner = planners.find((p) => p.id === currentId);
	const currentPlannerName = currentPlanner?.name ?? 'Unknown Planner';

	if (planners.length === 1) {
		return (
			<Text
				size="sm"
				truncate
				className={`${styles.row} ${styles.plannerName}`}
				data-testid="planner-context-static"
			>
				{currentPlannerName}
			</Text>
		);
	}

	return (
		<Menu width="target">
			<Menu.Target>
				<UnstyledButton
					className={`${styles.row} ${styles.trigger}`}
					data-testid="planner-context-trigger"
				>
					<Text size="sm" span truncate className={styles.plannerName}>
						{currentPlannerName}
					</Text>
					<IconChevronDown
						className={styles.chevron}
						data-testid="icon-chevron-down"
					/>
				</UnstyledButton>
			</Menu.Target>
			<Menu.Dropdown>
				{planners.map((planner) => (
					<Menu.Item
						key={planner.id}
						href={`/${planner.id}/calendar`}
						component={Link}
						data-testid={`planner-menu-item-${planner.id}`}
					>
						{planner.name}
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};
