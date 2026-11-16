import { z } from 'zod';

import { getPlanner } from '@/_actions/planner';
import { zId } from '@/_utils/zId';

import { CalendarView } from './_components/CalendarView/CalendarView';

const zParams = z.object({
	planner: zId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);
	const planner = await getPlanner(id);

	return (
		<CalendarView
			plannerId={id}
			calendar={planner.calendar}
			savedItems={planner.saved}
		/>
	);
};

export default CalendarPage;
