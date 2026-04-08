'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getPlannerClient } from '@/_actions';
import type { PlannerInterface } from '@/_models';

import { PlannerContext } from './PlannerContext';

type Props = {
	id: string;
	children: ReactNode;
};

export const PlannerProvider = ({ children, id }: Props) => {
	const [planner, setPlanner] = useState<PlannerInterface | null>(null);

	useEffect(() => {
		getPlannerClient(id)
			.then(setPlanner)
			.catch((err: unknown) => {
				throw err;
			});
	}, [id]);

	if (!planner) return null;

	return (
		<PlannerContext.Provider value={planner}>
			{children}
		</PlannerContext.Provider>
	);
};
