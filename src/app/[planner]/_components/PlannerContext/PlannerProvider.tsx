'use client';

import type { ReactNode } from 'react';

import type { AccessLevel, PlannerInterface } from '@/_models/types';

import { PlannerContext } from './PlannerContext';

type Props = {
	planner: PlannerInterface;
	accessLevel: AccessLevel;
	children: ReactNode;
};

export const PlannerProvider = ({ accessLevel, children, planner }: Props) => (
	<PlannerContext.Provider value={{ ...planner, accessLevel }}>
		{children}
	</PlannerContext.Provider>
);
