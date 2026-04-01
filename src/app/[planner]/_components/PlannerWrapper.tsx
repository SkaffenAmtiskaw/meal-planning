'use client';

import { useParams } from 'next/navigation';

import { AppShell, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Navbar, UserMenu } from '@/_components';

import { HEADER_HEIGHT } from '../_constants';

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
			<AppShell.Header>
				<Group h="100%" justify="space-between" px="sm">
					<Burger opened={opened} onClick={toggle} />
					<UserMenu />
				</Group>
			</AppShell.Header>
			<AppShell.Navbar>
				<Navbar id={planner as string} />
			</AppShell.Navbar>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};
