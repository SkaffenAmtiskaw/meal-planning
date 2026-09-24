import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Focuses a ref'd element after the parent `Collapse` expand animation/layout
 * completes.
 *
 * The textarea has `offsetHeight: 0` until after the expand layout completes,
 * so `.focus()` must be deferred via `requestAnimationFrame`.
 *
 * The state flag is cleared inside the rAF callback (not in the effect) so the
 * intent survives React StrictMode's double effect invocation.
 */
export function useFocusOnExpand<T extends HTMLElement>(expanded: boolean) {
	const ref = useRef<T>(null);
	const [shouldFocus, setShouldFocus] = useState(false);
	const rafRef = useRef<number | null>(null);

	const requestFocus = useCallback(() => {
		setShouldFocus(true);
	}, []);

	useEffect(() => {
		if (expanded && shouldFocus) {
			rafRef.current = requestAnimationFrame(() => {
				setShouldFocus(false);
				rafRef.current = null;
				ref.current?.focus();
			});
		}

		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [expanded, shouldFocus]);

	return { ref, requestFocus };
}
