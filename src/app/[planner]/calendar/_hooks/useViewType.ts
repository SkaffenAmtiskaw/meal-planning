import { useEffect, useState } from 'react';

export type ViewType = 'month' | 'week' | 'list';

export const DESKTOP_VIEWS: { label: string; value: ViewType }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'Week', value: 'week' },
	{ label: 'List', value: 'list' },
];

export const MOBILE_VIEWS: { label: string; value: ViewType }[] = [
	{ label: 'Month', value: 'month' },
	{ label: 'List', value: 'list' },
];

export const useViewType = (isMobile: boolean | undefined) => {
	const [viewType, setViewType] = useState<ViewType>('month');

	useEffect(() => {
		if (isMobile && viewType === 'week') {
			setViewType('list');
		}
	}, [isMobile, viewType]);

	return { viewType, setViewType };
};
