'use client';

import { createContext } from 'react';

import type { AccessLevel, PlannerInterface } from '@/_models/types';

type PlannerContextValue = PlannerInterface & { accessLevel: AccessLevel };

// biome-ignore lint/suspicious/noExplicitAny: there is no valid value of PlannerContext if it is not wrapped in a provider
export const PlannerContext = createContext<PlannerContextValue>(null as any);
