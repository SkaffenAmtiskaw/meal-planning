import type {
	CalendarModalData,
	CalendarModalState,
	CalendarModalType,
} from '../types';

/** The data `type` was opened with while it's the open modal, or else null. */
export function dataIfOpen<K extends CalendarModalType>(
	state: CalendarModalState,
	type: K,
): CalendarModalData[K] | null {
	// Comparing with a generic `type` doesn't narrow `state`, so the cast is
	// what ties the data to K.
	return state.type === type ? (state.data as CalendarModalData[K]) : null;
}
