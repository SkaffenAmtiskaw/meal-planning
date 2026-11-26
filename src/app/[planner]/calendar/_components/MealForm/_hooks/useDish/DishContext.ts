'use client';

import { createContext } from 'react';

import type { DishDraft } from '../../types';

// Null outside the provider, so the hook can tell a missing provider.
export const DishContext = createContext<DishDraft | null>(null);
