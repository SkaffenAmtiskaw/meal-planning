'use client';

import { useSelectedLayoutSegment } from 'next/navigation';

import { IconBook, IconCalendarWeek } from '@tabler/icons-react';

import { NavLink } from '@/_components/NavLink';

import { PlannerContextSection } from './PlannerContextSection';

type PlannerItem = { id: string; name: string };

type Props = {
	id: string;
	planners: PlannerItem[];
};

export const Navbar = ({ id, planners }: Props) => {
	const segment = useSelectedLayoutSegment();

	return (
		<>
			<PlannerContextSection currentId={id} planners={planners} />
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
