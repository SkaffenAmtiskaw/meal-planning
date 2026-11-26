import { z } from 'zod';

import { zBookmarkInterface } from '@/_models/library';

/**
 * Only the fields the form edits, so a field the server sets never comes from the browser.
 * The form starts notes at '', and the action leaves it out before it writes.
 */
export const zBookmarkInput = zBookmarkInterface
	.pick({ name: true, url: true, tags: true })
	.extend({
		plannerId: z.string(),
		notes: z.string().optional(),
	});
