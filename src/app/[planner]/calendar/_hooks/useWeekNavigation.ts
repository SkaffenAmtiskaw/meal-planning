import { useCallback, useState } from 'react';

import { getWeekStart } from '../_utils/getWeekStart';

export const useWeekNavigation = (initialDate?: string) => {
	const [currentWeekStart, setCurrentWeekStart] = useState(() =>
		getWeekStart(initialDate),
	);

	const handlePrevWeek = useCallback(() => {
		setCurrentWeekStart((w) => w.subtract({ days: 7 }));
	}, []);

	const handleNextWeek = useCallback(() => {
		setCurrentWeekStart((w) => w.add({ days: 7 }));
	}, []);

	const handleToday = useCallback(() => {
		setCurrentWeekStart(getWeekStart(undefined));
	}, []);

	return { currentWeekStart, handlePrevWeek, handleNextWeek, handleToday };
};
