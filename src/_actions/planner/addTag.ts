/* v8 ignore start */
'use server';

import { Planner } from '@/_models';

// TODO: Set a color scheme for tags
const COLORS = [
	'red',
	'pink',
	'grape',
	'violet',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'green',
	'lime',
	'yellow',
	'orange',
];

export const addTag = async (plannerId: string, name: string) => {
	const planner = await Planner.findById(plannerId);
	if (!planner) throw new Error('Planner not found');

	const color = COLORS[planner.tags.length % COLORS.length];
	planner.tags.push({ name, color } as any);
	// await planner.save();

	const tag = planner.tags[planner.tags.length - 1];
	return { _id: tag._id.toString(), name: tag.name, color: tag.color };
};
/* v8 ignore stop */
