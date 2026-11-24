'use client';

import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';

import { Snackbar } from './Snackbar';
import { SnackbarContext } from './SnackbarContext';
import type { SnackbarMessage } from './types';

const DURATION_MS = 4000;
const UNDO_DURATION_MS = 6000;

/**
 * Holds the confirmation bar's message and draws the bar. Mount it above
 * anything that shows a message and then goes away, such as a modal, so the
 * bar outlives it.
 */
export function SnackbarProvider({ children }: { children: ReactNode }) {
	const [current, setCurrent] = useState<SnackbarMessage | null>(null);

	// Each shown message is a new object, so showing one restarts the timer.
	useEffect(() => {
		if (current === null) {
			return;
		}
		const timer = setTimeout(
			() => setCurrent(null),
			current.onUndo ? UNDO_DURATION_MS : DURATION_MS,
		);
		return () => clearTimeout(timer);
	}, [current]);

	const show = useCallback((message: SnackbarMessage) => {
		setCurrent({ ...message });
	}, []);

	const undo = () => {
		current?.onUndo?.();
		setCurrent(null);
	};

	const value = useMemo(() => ({ show }), [show]);

	return (
		<SnackbarContext.Provider value={value}>
			{children}
			<Snackbar snackbar={current} onUndo={undo} />
		</SnackbarContext.Provider>
	);
}
