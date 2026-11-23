'use client';

import type { ReactNode } from 'react';

import type { AccessLevel } from '@/_models/types';

import { PlannerContext } from './PlannerContext';

type Props = {
	accessLevel: AccessLevel;
	children: ReactNode;
};

export const PlannerProvider = ({ accessLevel, children }: Props) => (
	<PlannerContext.Provider value={{ accessLevel }}>
		{children}
	</PlannerContext.Provider>
);
