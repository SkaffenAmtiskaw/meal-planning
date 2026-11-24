'use client';

import { type ReactNode, useCallback, useState } from 'react';

import { CalendarModalContext } from './CalendarModalContext';
import type {
	CalendarModalData,
	CalendarModalState,
	CalendarModalType,
} from './types';

/** Holds which calendar modal is open and what it opened with. `CalendarModals` draws them. */
export function CalendarModalProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<CalendarModalState>({
		type: null,
		data: null,
	});

	const open = useCallback(
		<T extends CalendarModalType>(type: T, data: CalendarModalData[T]) => {
			setState({ type, data } as CalendarModalState);
		},
		[],
	);

	const close = useCallback(() => {
		setState({ type: null, data: null });
	}, []);

	return (
		<CalendarModalContext.Provider value={{ state, open, close }}>
			{children}
		</CalendarModalContext.Provider>
	);
}
