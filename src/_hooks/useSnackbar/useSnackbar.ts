'use client';

import { useContext } from 'react';

import { SnackbarContext } from './SnackbarContext';
import type { SnackbarContextValue } from './types';

/**
 * Shows a brief message in the confirmation bar at the bottom of the screen.
 * Must be used within a SnackbarProvider.
 * @throws Error if used outside of SnackbarProvider
 */
export const useSnackbar = (): SnackbarContextValue => {
	const context = useContext(SnackbarContext);

	if (context === null) {
		throw new Error('useSnackbar must be used within a SnackbarProvider');
	}

	return context;
};
