'use client';

import { useParams } from 'next/navigation';

import { AppShell, AppShellMain, AppShellNavbar, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Navbar } from '@/_components';
import { Header } from '@/app/_components/Header';

import { HEADER_HEIGHT } from '../../_constants';

export const PlannerWrapper = ({ children }: { children: React.ReactNode }) => {
	const [opened, { toggle }] = useDisclosure();

	const { planner } = useParams();

	return (
		<AppShell
			header={{
				height: HEADER_HEIGHT,
			}}
			navbar={{
				breakpoint: 'sm',
				collapsed: {
					mobile: !opened,
					desktop: !opened,
				},
				width: 300,
			}}
		>
			<Header leftSection={<Burger opened={opened} onClick={toggle} />} />
			<AppShellNavbar>
				<Navbar id={planner as string} />
			</AppShellNavbar>
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};
