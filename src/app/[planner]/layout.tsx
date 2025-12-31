'use client';

import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useParams } from 'next/navigation';

import { Navbar } from '@/_components';

import { HEADER_HEIGHT } from './_constants';

const Layout = ({ children }: LayoutProps<'/[planner]'>) => {
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
				<Burger opened={opened} onClick={toggle} />
			</AppShell.Header>
			<AppShell.Navbar>
				<Navbar id={planner as string} />
			</AppShell.Navbar>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};

export default Layout;
