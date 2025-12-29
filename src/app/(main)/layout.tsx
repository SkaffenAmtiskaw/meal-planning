'use client';

import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Navbar } from '@/_components';
import { useOneTap } from '@/_hooks';

import { HEADER_HEIGHT } from './_constants';

const Layout = ({ children }: LayoutProps<'/'>) => {
	useOneTap();

	const [opened, { toggle }] = useDisclosure();

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
				<Navbar />
			</AppShell.Navbar>
			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
};

export default Layout;
