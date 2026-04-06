import { notFound, redirect } from 'next/navigation';

import { z } from 'zod';

import { checkAuth } from '@/_actions';
import { zObjectId } from '@/_models';

import { PlannerLayout } from './_components';

const zParams = z.object({
	planner: zObjectId,
});

const Layout = async ({ children, params }: LayoutProps<'/[planner]'>) => {
	const { planner: id } = zParams.parse(await params);

	const result = await checkAuth(id);

	if (result.type === 'unauthenticated') redirect('/');
	if (result.type === 'unauthorized') notFound();
	if (result.type === 'error') throw result.error;

	// TODO: Add suspense so the layout will still load while the auth is being checked
	return <PlannerLayout>{children}</PlannerLayout>;
};

export default Layout;
