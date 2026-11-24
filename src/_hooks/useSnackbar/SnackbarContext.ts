'use client';

import { createContext } from 'react';

import type { SnackbarContextValue } from './types';

// Null outside the provider, so the hook can tell when it's used without one.
export const SnackbarContext = createContext<SnackbarContextValue | null>(null);
