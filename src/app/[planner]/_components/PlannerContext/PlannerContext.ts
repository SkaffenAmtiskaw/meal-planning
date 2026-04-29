'use client';

import { createContext } from 'react';

import type { PlannerInterface } from '@/_models';
import type { AccessLevel } from '@/_models/user';

type PlannerContextValue = PlannerInterface & { accessLevel: AccessLevel };

// biome-ignore lint/suspicious/noExplicitAny: there is no valid value of PlannerContext if it is not wrapped in a provider
export const PlannerContext = createContext<PlannerContextValue>(null as any);
