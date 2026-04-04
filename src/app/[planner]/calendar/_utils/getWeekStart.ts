export const getWeekStart = (
	dateStr: string | undefined,
): Temporal.PlainDate => {
	const date = dateStr
		? Temporal.PlainDate.from(dateStr)
		: Temporal.Now.plainDateISO();
	return date.subtract({ days: date.dayOfWeek % 7 });
};
