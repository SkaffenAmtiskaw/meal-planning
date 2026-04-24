export const toLocaleDateString = (dateString: string): string => {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

export const isWithinHours = (
	dateString: string,
	hoursThreshold = 24,
): boolean => {
	const targetDate = new Date(dateString);
	const now = new Date();
	const diffMs = targetDate.getTime() - now.getTime();
	const diffHours = diffMs / (1000 * 60 * 60);
	return diffHours <= hoursThreshold && diffHours > 0;
};

export const isPastDate = (dateString: string): boolean => {
	const targetDate = new Date(dateString);
	const now = new Date();
	return targetDate.getTime() < now.getTime();
};
