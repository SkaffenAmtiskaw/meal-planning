'use client';

import { createContext, type ReactNode } from 'react';

import { useMounted } from '@mantine/hooks';

export const TimeZoneContext = createContext<string | null>(null);

type Props = {
	timeZone: string | null;
	children: ReactNode;
};

/**
 * Hands the viewer's time zone to client components. With no zone passed, it
 * gives none while the server draws and React hydrates, then the browser's own.
 */
export const TimeZoneProvider = ({ timeZone, children }: Props) => {
	const mounted = useMounted();
	const value =
		timeZone ??
		(mounted ? Intl.DateTimeFormat().resolvedOptions().timeZone : null);

	return (
		<TimeZoneContext.Provider value={value}>
			{children}
		</TimeZoneContext.Provider>
	);
};
