'use client';

import { createContext } from 'react';

import type { AccessLevel } from '@/_models/types';

type PlannerContextValue = { accessLevel: AccessLevel };

// biome-ignore lint/suspicious/noExplicitAny: there is no valid value of PlannerContext if it is not wrapped in a provider
export const PlannerContext = createContext<PlannerContextValue>(null as any);
