import { useCallback } from 'react';

import type { DateTime } from 'luxon';

import { LIST_VIEW_TOP_PADDING } from './constants';

export function useScrollToDate(
	containerRef: React.RefObject<HTMLElement | null>,
): (date: DateTime, behavior?: ScrollBehavior) => void {
	return useCallback(
		(date: DateTime, behavior: ScrollBehavior = 'smooth') => {
			const container = containerRef.current;
			if (!container) {
				return;
			}

			const isoDate = date.toISODate();
			if (!isoDate) {
				return;
			}

			const row = container.querySelector<HTMLElement>(
				`[data-iso="${isoDate}"]`,
			);
			if (!row) {
				return;
			}

			const rowRect = row.getBoundingClientRect();
			const containerRect = container.getBoundingClientRect();
			const top =
				rowRect.top -
				containerRect.top +
				container.scrollTop -
				LIST_VIEW_TOP_PADDING;
			container.scrollTo({ top, behavior });
		},
		[containerRef],
	);
}
