'use client';

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

// Registers an open layer and returns the function that unregisters it.
type RegisterLayer = () => () => void;

const EscapeLayersContext = createContext<RegisterLayer | null>(null);

export const EscapeLayersProvider = EscapeLayersContext.Provider;

/**
 * For a modal frame: tracks the layers open inside it that close on Esc
 * themselves, such as a picker's popover or link mode. While any is open the
 * frame turns off its own Esc close, so one Esc closes only the top layer.
 */
export function useEscapeLayers(): {
	anyOpen: boolean;
	register: RegisterLayer;
} {
	const [openCount, setOpenCount] = useState(0);
	const register = useCallback(() => {
		setOpenCount((count) => count + 1);
		return () => setOpenCount((count) => count - 1);
	}, []);
	return { anyOpen: openCount > 0, register };
}

/**
 * For a layer inside a modal frame that closes on Esc itself: tells the frame
 * it's open. Outside a frame, such as in the calendar header, it does nothing.
 */
export function useEscapeLayer(open: boolean): void {
	const register = useContext(EscapeLayersContext);
	useEffect(() => {
		if (!open || !register) {
			return;
		}
		return register();
	}, [open, register]);
}
