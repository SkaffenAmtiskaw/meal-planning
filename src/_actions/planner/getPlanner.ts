import 'server-only';

import { notFound } from 'next/navigation';
import { cache } from 'react';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { planners } from '@/_models/database/planners';

export const getPlanner = cache(async (id: string) => {
	const auth = await checkAuth(id, 'read');

	if (auth.type === 'error') throw auth.error;
	if (auth.type !== 'authorized') return notFound();

	const planner = await planners.findOne({ _id: id });

	if (!planner) {
		throw new Error(`Planner ${id} not found`);
	}

	return planner;
});
