'use client';

import Link from 'next/link';

import { NavLink as MantineNavLink, Menu } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import styles from './PlannerContextSection.module.css';

type PlannerItem = { id: string; name: string };

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
		// Single planner mode - static NavLink (non-interactive)
		return (
			<MantineNavLink
				label={currentPlannerName}
				classNames={{ root: styles.staticLabel }}
				data-testid="planner-context-static"
			/>
		);
	}

	// Multi-planner mode - interactive dropdown
	return (
		<Menu width="target">
			<Menu.Target>
				<MantineNavLink
					label={currentPlannerName}
					rightSection={<IconChevronDown data-testid="icon-chevron-down" />}
					classNames={{
						root: styles.trigger,
						label: styles.plannerName,
						section: styles.chevron,
					}}
					data-testid="planner-context-trigger"
				/>
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
