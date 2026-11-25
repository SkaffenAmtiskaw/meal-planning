import type { TagInterface } from '@/_models/types';

// A saved item stores its tags as ids; an id whose tag was deleted is dropped.
export const resolveTags = (
	tagIds: string[] | undefined,
	tags: TagInterface[],
): TagInterface[] =>
	(tagIds ?? [])
		.map((id) => tags.find((tag) => tag._id === id))
		.filter((tag): tag is TagInterface => tag !== undefined);
