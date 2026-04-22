'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getPlannerClient } from '@/_actions';
import type { AccessLevel, PlannerInterface } from '@/_models';

import { PlannerContext } from './PlannerContext';

type Props = {
	id: string;
	accessLevel: AccessLevel;
	children: ReactNode;
};

export const PlannerProvider = ({ accessLevel, children, id }: Props) => {
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
		<PlannerContext.Provider value={{ ...planner, accessLevel }}>
			{children}
		</PlannerContext.Provider>
	);
};
