'use client';

import { useContext } from 'react';

import { ToggleContext } from './ToggleContext';

export const useToggleContext = () => {
	const ctx = useContext(ToggleContext);
	if (!ctx)
		throw new Error('useToggleContext must be used within ToggleProvider');
	return ctx;
};
