'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';
import type { TagInterface } from '@/_models/planner/tag';
import type { ActionResult } from '@/_utils/actionResult';

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

export const addTag = async (
	plannerId: string,
	name: string,
): Promise<ActionResult<{ _id: string; name: string; color: string }>> => {
	const auth = await checkAuth(new Types.ObjectId(plannerId));
	if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

	const planner = await Planner.findById(plannerId);
	if (!planner) return { ok: false, error: 'Planner not found' };

	const color = COLORS[planner.tags.length % COLORS.length];
	planner.tags.push({ name, color } as unknown as TagInterface);
	await planner.save();

	const tag = planner.tags[planner.tags.length - 1];
	return {
		ok: true,
		data: { _id: tag._id.toString(), name: tag.name, color: tag.color },
	};
};
