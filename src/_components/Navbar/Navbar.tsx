'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

import { Divider, NavLink } from '@mantine/core';
import { IconBook, IconCalendarWeek } from '@tabler/icons-react';

import { PlannerSwitcher } from './PlannerSwitcher';

type PlannerItem = { id: string; name: string };

type Props = {
	id: string;
	planners?: PlannerItem[];
};

export const Navbar = ({ id, planners = [] }: Props) => {
	const segment = useSelectedLayoutSegment();

	return (
		<>
			{planners.length > 0 && (
				<>
					<PlannerSwitcher currentId={id} planners={planners} />
					<Divider />
				</>
			)}
			<NavLink
				active={segment === 'calendar'}
				href={`/${id}/calendar`}
				label="Calendar"
				leftSection={<IconCalendarWeek />}
			/>
			<NavLink
				active={segment === 'recipes'}
				href={`/${id}/recipes`}
				label="Recipes"
				leftSection={<IconBook />}
			/>
		</>
	);
};
