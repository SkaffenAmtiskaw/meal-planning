import { z } from 'zod';

import { zObjectId } from '@/_utils/zObjectId';

import { CalendarView } from './_components/CalendarView/CalendarView';

const zParams = z.object({
	planner: zObjectId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);

	return <CalendarView plannerId={String(id)} />;
};

export default CalendarPage;
