'use client';

import Link from 'next/link';

import { NavLink as MantineNavLink } from '@mantine/core';

import styles from './NavLink.module.css';

type Props = {
	label: string;
	active?: boolean;
	href: string;
	leftSection?: React.ReactNode;
	labelClassName?: string;
	onClick?: () => void;
};

export const NavLink = ({
	label,
	active,
	href,
	leftSection,
	labelClassName,
	onClick,
	...others
}: Props) => (
	<MantineNavLink
		component={Link}
		className={styles.navLink}
		classNames={{
			label: labelClassName ?? styles.navLinkLabel,
		}}
		active={active}
		href={href}
		leftSection={leftSection}
		onClick={onClick}
		label={label}
		{...others}
	/>
);
