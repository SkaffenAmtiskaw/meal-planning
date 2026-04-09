import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppShell, AppShellMain } from '@mantine/core';

import { getUser } from '@/_actions';
import { zObjectId } from '@/_models';
import { catchify } from '@/_utils/catchify';
import { Header } from '@/app/_components/Header';
import { HEADER_HEIGHT } from '@/app/_constants';

import { BackButton } from './_components/BackButton';

const Layout = async ({ children }: { children: React.ReactNode }) => {
	const [user] = await catchify(getUser);
	const planners = user?.planners ?? [];

	if (!planners.length) redirect('/');

	const cookieStore = await cookies();
	const lastPlannerId = cookieStore.get('lastOpenedPlanner')?.value;
	const parsed = zObjectId.safeParse(lastPlannerId);
	const plannerId =
		parsed.success &&
		planners.some((p) => String(p) === lastPlannerId) &&
		lastPlannerId
			? lastPlannerId
			: String(planners[0]);

	return (
		<AppShell header={{ height: HEADER_HEIGHT }}>
			<Header leftSection={<BackButton href={`/${plannerId}/calendar`} />} />
			<AppShellMain>{children}</AppShellMain>
		</AppShell>
	);
};

export default Layout;
