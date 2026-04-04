import { z } from 'zod';

import { getPlanner } from '@/_actions';
import { zObjectId } from '@/_models';

import { CalendarView } from './_components/CalendarView';
import type { SerializedDay } from './_utils/toScheduleXEvents';

const zParams = z.object({
	planner: zObjectId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);
	const planner = await getPlanner(id);

	const savedItems = planner.saved.map((item) => ({
		_id: String(item._id),
		name: item.name,
		url: 'url' in item ? item.url : undefined,
	}));

	const calendar = JSON.parse(
		JSON.stringify(planner.calendar ?? []),
	) as SerializedDay[];

	return (
		<CalendarView
			plannerId={String(id)}
			savedItems={savedItems}
			calendar={calendar}
		/>
	);
};

export default CalendarPage;
