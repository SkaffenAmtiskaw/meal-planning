'use client';

import { NavLink } from '@mantine/core';
import { IconBook, IconCalendarWeek } from '@tabler/icons-react';

import { useSelectedLayoutSegment } from 'next/navigation';

export const Navbar = ({ id }: { id: string }) => {
	const segment = useSelectedLayoutSegment();

	return (
		<>
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
