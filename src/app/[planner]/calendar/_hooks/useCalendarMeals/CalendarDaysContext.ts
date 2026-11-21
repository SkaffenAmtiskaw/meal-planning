'use client';

import { createContext } from 'react';

import type { DayInterface } from '@/_models/types';

// Null outside the provider, so the hook can tell a missing provider from a calendar with no days.
export const CalendarDaysContext = createContext<DayInterface[] | null>(null);
