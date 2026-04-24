'use client';

import { createContext } from 'react';

export interface ToggleContextValue {
	opened: boolean;
	toggle: () => void;
}

export const ToggleContext = createContext<ToggleContextValue | null>(null);
