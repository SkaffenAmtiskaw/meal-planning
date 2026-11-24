import { z } from 'zod';

import { getSavedItems } from '@/_actions/library/getSavedItems';
import { getPlanner } from '@/_actions/planner/getPlanner';
import { zId } from '@/_utils/zId';

import { CalendarView } from './_components/CalendarView/CalendarView';

const zParams = z.object({
	planner: zId,
});

// Both reads check the user's read access, since the layout's check doesn't stop the page from running.
const CalendarPage = async ({ params }: PageProps<'/[planner]/calendar'>) => {
	const { planner: id } = zParams.parse(await params);
	const [planner, savedItems] = await Promise.all([
		getPlanner(id),
		getSavedItems(id),
	]);

	return (
		<CalendarView
			plannerId={id}
			calendar={planner.calendar}
			savedItems={savedItems}
		/>
	);
};

export default CalendarPage;
