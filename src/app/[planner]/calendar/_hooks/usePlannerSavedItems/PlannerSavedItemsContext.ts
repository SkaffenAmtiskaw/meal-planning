'use client';

import { createContext } from 'react';

import type { SavedItem } from '@/_actions/library/types';

// Null outside the provider, so the hook can tell a missing provider from a planner with no saved items.
export const PlannerSavedItemsContext = createContext<SavedItem[] | null>(null);
