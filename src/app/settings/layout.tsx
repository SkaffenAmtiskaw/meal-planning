import { redirect } from 'next/navigation';

import { AppShell, AppShellMain } from '@mantine/core';

import { getUser } from '@/_actions';
import { catchify } from '@/_utils/catchify';
import { Header } from '@/app/_components/Header';
import { HEADER_HEIGHT } from '@/app/_constants';

import { BackButton } from './_components/BackButton';

const Layout = async ({ children }: { children: React.ReactNode }) => {
	const [user] = await catchify(getUser);

	if (!user?.planners.length) redirect('/');

	const plannerId = String(user?.planners[0]);

	return (
		<AppShell header={{ height: HEADER_HEIGHT }}>
			<Header leftSection={<BackButton href={`/${plannerId}/calendar`} />} />
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};

export default Layout;
