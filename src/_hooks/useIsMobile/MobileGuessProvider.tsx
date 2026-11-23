'use client';

import { createContext, type ReactNode } from 'react';

/**
 * Whether the server guessed, from the request's user agent, that the viewer
 * is on a phone. Client Components can't read the request, so the root layout
 * hands the guess down through this context. `useIsMobile()` starts from it,
 * then switches to the window's real width once the page has loaded.
 */
export const MobileGuessContext = createContext(false);

type Props = {
	isMobile: boolean;
	children: ReactNode;
};

/**
 * Hands the server's phone-or-desktop guess to `useIsMobile()`, so the
 * browser's first render draws the same layout the server did.
 */
export const MobileGuessProvider = ({ isMobile, children }: Props) => (
	<MobileGuessContext.Provider value={isMobile}>
		{children}
	</MobileGuessContext.Provider>
);
