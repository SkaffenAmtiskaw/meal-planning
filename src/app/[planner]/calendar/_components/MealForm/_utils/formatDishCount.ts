// "1 dish" or "3 dishes".
export const formatDishCount = (count: number): string =>
	`${count} ${count === 1 ? 'dish' : 'dishes'}`;
