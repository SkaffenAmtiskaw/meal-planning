'use client';

import Link from 'next/link';

import { NavLink as MantineNavLink } from '@mantine/core';

type Props = {
	label: string;
	active?: boolean;
	href: string;
	leftSection?: React.ReactNode;
	onClick?: () => void;
};

export const NavLink = ({
	label,
	active,
	href,
	leftSection,
	onClick,
}: Props) => (
	<MantineNavLink
		component={Link}
		active={active}
		href={href}
		leftSection={leftSection}
		onClick={onClick}
		label={label}
	/>
);
