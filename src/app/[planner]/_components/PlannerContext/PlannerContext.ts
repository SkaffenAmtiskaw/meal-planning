'use client';

import { createContext } from 'react';

import type { PlannerInterface } from '@/_models';

// @ts-expect-error - there is no valid value of PlannerContext if it is not wrapped in a provider
export const PlannerContext = createContext<PlannerInterface>(null);
