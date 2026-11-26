'use client';

import { createContext } from 'react';

import type { MealDishes } from './types';

// Null outside the provider, so the hook can tell a missing provider.
export const MealDishesContext = createContext<MealDishes | null>(null);
