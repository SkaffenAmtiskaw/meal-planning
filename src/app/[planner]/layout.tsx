import 'server-only';

import { notFound, redirect } from 'next/navigation';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { getPlanner } from '@/_actions/planner';
import { TimeZoneProvider } from '@/_hooks';
import { zId } from '@/_utils/zId';
import { Header } from '@/app/_components/Header';

import { BurgerToggle, PlannerLayout, PlannerProvider } from './_components';

import { NavbarServer } from './_components/NavbarServer';
import { getCookieTimeZone } from './_utils/getCookieTimeZone';

const zParams = z.object({
	planner: zId,
});

const Layout = async ({ children, params }: LayoutProps<'/[planner]'>) => {
	const { planner: id } = zParams.parse(await params);

	const result = await checkAuth(id, 'read');

	if (result.type === 'unauthenticated') redirect('/');
	if (result.type === 'unauthorized') notFound();
	if (result.type === 'error') throw result.error;

	const planner = await getPlanner(id);

	// TODO: Add suspense so the layout will still load while the auth is being checked
	return (
		<PlannerLayout
			header={
				<Header
					leftSection={<BurgerToggle color="var(--mantine-color-chalk-5)" />}
				/>
			}
			navbar={<NavbarServer id={id} />}
		>
			<TimeZoneProvider timeZone={await getCookieTimeZone()}>
				<PlannerProvider planner={planner} accessLevel={result.accessLevel}>
					{children}
				</PlannerProvider>
			</TimeZoneProvider>
		</PlannerLayout>
	);
};

export default Layout;
