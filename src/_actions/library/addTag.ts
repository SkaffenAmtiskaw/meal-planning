'use server';

import { z } from 'zod';

import { plannerCache } from '@/_actions/_utils/caches';
import { defineMutation } from '@/_actions/_utils/defineMutation';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';
import type { TagInterface } from '@/_models/library';
import { TAG_COLOR_NAMES } from '@/_theme/colors';
import { zId } from '@/_utils/zId';

const zAddTagSchema = z.object({
	plannerId: zId,
	name: z.string(),
});

export const addTag = defineMutation({
	schema: zAddTagSchema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.tags(input.plannerId)],
	handler: async ({ plannerId, name }) => {
		const planner = await planners.findOne({ _id: plannerId });
		if (!planner) return { ok: false, error: 'Planner not found' };

		const tag: TagInterface = {
			_id: newId(),
			name,
			color: TAG_COLOR_NAMES[planner.tags.length % TAG_COLOR_NAMES.length],
		};

		await planners.updateOne({ _id: plannerId }, { $push: { tags: tag } });

		return { ok: true, data: tag };
	},
});
