import { redirect } from 'next/navigation';

import { AppShell, AppShellMain } from '@mantine/core';

import { getUser } from '@/_actions/user';
import { isNoSessionError } from '@/_actions/user/noSessionError';
import { catchify } from '@/_utils/catchify';
import { reportError } from '@/_utils/reportError';
import { Header } from '@/app/_components/Header';
import { HEADER_HEIGHT } from '@/app/_constants';
import { getLastOpenedPlannerId } from '@/app/_utils/getLastOpenedPlannerId';

import { BackButton } from './_components/BackButton';

const Layout = async ({ children }: { children: React.ReactNode }) => {
	const [user, userError] = await catchify(getUser);
	if (userError && !isNoSessionError(userError)) await reportError(userError);
	const planners = user?.planners ?? [];

	if (!planners.length) return redirect('/');

	const plannerId = await getLastOpenedPlannerId(planners);

	return (
		<AppShell header={{ height: HEADER_HEIGHT }}>
			<Header leftSection={<BackButton href={`/${plannerId}/calendar`} />} />
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};

export default Layout;
