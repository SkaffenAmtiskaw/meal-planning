import type { ViewType } from '../_hooks/useViewType';

export const getScheduleXViewId = (
	viewType: Exclude<ViewType, 'week'>,
	isMobile: boolean | undefined,
): string => {
	if (viewType === 'list') return 'list';
	return isMobile ? 'month-agenda' : 'month-grid';
};
