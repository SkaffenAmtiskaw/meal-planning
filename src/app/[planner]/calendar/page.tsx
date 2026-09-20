import { z } from 'zod';

import { getPlannerClient } from '@/_actions/planner';
import { zObjectId } from '@/_utils/zObjectId';

import { CalendarView } from './_components/CalendarView/CalendarView';
import type { SavedItem, SerializedDay } from './_utils/toScheduleXEvents';

const zParams = z.object({
	planner: zObjectId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);
	const planner = await getPlannerClient(String(id));

	return (
		<CalendarView
			plannerId={String(id)}
			calendar={planner.calendar as unknown as SerializedDay[]}
			savedItems={planner.saved as unknown as SavedItem[]}
		/>
	);
};

export default CalendarPage;
