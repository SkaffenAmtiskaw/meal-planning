'use client';

import { useParams } from 'next/navigation';

import { AppShell, AppShellMain, AppShellNavbar, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Header } from '@/app/_components/Header';

import { useLastOpenedPlanner } from './useLastOpenedPlanner';

import { HEADER_HEIGHT } from '../../_constants';

type Props = {
	children: React.ReactNode;
	navbar?: React.ReactNode;
};

export const PlannerLayout = ({ children, navbar }: Props) => {
	const [opened, { toggle }] = useDisclosure();

	const { planner } = useParams();

	useLastOpenedPlanner(planner as string);

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
			<Header
				leftSection={
					<Burger opened={opened} onClick={toggle} color="#EFE7E9" />
				}
			/>
			<AppShellNavbar>{navbar}</AppShellNavbar>
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};
