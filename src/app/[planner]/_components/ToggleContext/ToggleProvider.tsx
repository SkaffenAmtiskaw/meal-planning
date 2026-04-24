'use client';

import type { ReactNode } from 'react';

import { useDisclosure } from '@mantine/hooks';

import { ToggleContext } from './ToggleContext';

interface ToggleProviderProps {
	children: ReactNode;
}

export const ToggleProvider = ({ children }: ToggleProviderProps) => {
	const [opened, { toggle }] = useDisclosure();

	return (
		<ToggleContext.Provider value={{ opened, toggle }}>
			{children}
		</ToggleContext.Provider>
	);
};
