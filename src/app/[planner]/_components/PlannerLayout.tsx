'use client';

import { useParams } from 'next/navigation';

import { AppShell, AppShellMain, AppShellNavbar } from '@mantine/core';

import { ToggleProvider, useToggleContext } from './ToggleContext';
import { useLastOpenedPlanner } from './useLastOpenedPlanner';

import { HEADER_HEIGHT } from '../../_constants';

type Props = {
	children: React.ReactNode;
	navbar?: React.ReactNode;
	header?: React.ReactNode;
};

const PlannerLayoutContent = ({ children, navbar, header }: Props) => {
	const { opened } = useToggleContext();
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
			{header}
			<AppShellNavbar>{navbar}</AppShellNavbar>
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};

export const PlannerLayout = ({ children, navbar, header }: Props) => {
	return (
		<ToggleProvider>
			<PlannerLayoutContent navbar={navbar} header={header}>
				{children}
			</PlannerLayoutContent>
		</ToggleProvider>
	);
};
