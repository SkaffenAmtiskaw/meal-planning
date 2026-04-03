import { z } from 'zod';

import { getPlanner } from '@/_actions';
import { zObjectId } from '@/_models';

import { CalendarView } from './_components/CalendarView';

const zParams = z.object({
	planner: zObjectId,
});

const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);
	const planner = await getPlanner(id);

	const savedItems = planner.saved.map((item) => ({
		_id: String(item._id),
		name: item.name,
	}));

	return <CalendarView plannerId={String(id)} savedItems={savedItems} />;
};

export default CalendarPage;
