import { useEffect } from 'react';

import type { ViewType } from './useViewType';

import { getScheduleXViewId } from '../_utils/getScheduleXViewId';

type InternalCalendarApp = {
	$app?: {
		calendarState?: {
			setView: (viewId: string, date: unknown) => void;
		};
		datePickerState?: {
			selectedDate: { value: unknown };
		};
	};
};

export const useScheduleXSync = (
	calendarApp: unknown,
	viewType: ViewType,
	isMobile: boolean | undefined,
): void => {
	useEffect(() => {
		if (viewType === 'week') return;
		const $app = (calendarApp as InternalCalendarApp)?.$app;
		if (!$app?.calendarState) return;
		const viewId = getScheduleXViewId(viewType, isMobile);
		$app.calendarState.setView(
			viewId,
			$app.datePickerState?.selectedDate.value,
		);
	}, [viewType, isMobile, calendarApp]);
};
