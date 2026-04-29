import { z } from 'zod';

import { zObjectId } from '@/_models';

import { CalendarView } from './_components/CalendarView/CalendarView';

const zParams = z.object({
	planner: zObjectId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);

	return <CalendarView plannerId={String(id)} />;
};

export default CalendarPage;
