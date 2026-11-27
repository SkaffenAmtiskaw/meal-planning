'use client';

import { createContext } from 'react';

import type { DishLinking } from './useDishLinking';

// Null outside the provider, so the hook can tell a missing provider.
export const DishLinkingContext = createContext<DishLinking | null>(null);
