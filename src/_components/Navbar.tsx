'use client';

import { NavLink } from '@mantine/core';
import { IconBook, IconCalendarWeek } from '@tabler/icons-react';

import { useSelectedLayoutSegment } from 'next/navigation';

export const Navbar = () => {
	const segment = useSelectedLayoutSegment();

	return (
		<>
			<NavLink
				active={segment === 'planner'}
				href="/planner"
				label="Planner"
				leftSection={<IconCalendarWeek />}
			/>
			<NavLink
				active={segment === 'recipes'}
				href="/recipes"
				label="Recipes"
				leftSection={<IconBook />}
			/>
		</>
	);
};
