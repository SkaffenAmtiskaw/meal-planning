import { DateTime } from 'luxon';

const WINDOW_SIZE = 35;
const START_OFFSET = -14;
const END_OFFSET = 20;

/**
 * Returns a fixed 35-day window of DateTime days around the range anchor,
 * guaranteeing that today is included in the returned range.
 */
export function getListDayRange(rangeAnchor: DateTime): DateTime[] {
	const today = DateTime.now().startOf('day');
	const anchorStart = rangeAnchor.startOf('day');

	let start = anchorStart.plus({ days: START_OFFSET });
	let end = anchorStart.plus({ days: END_OFFSET });

	if (today < start) {
		start = today;
		end = today.plus({ days: WINDOW_SIZE - 1 });
	} else if (today > end) {
		end = today;
		start = today.plus({ days: -(WINDOW_SIZE - 1) });
	}

	const days: DateTime[] = [];
	let current = start;

	while (current <= end) {
		days.push(current.startOf('day'));
		current = current.plus({ days: 1 });
	}

	return days;
}
