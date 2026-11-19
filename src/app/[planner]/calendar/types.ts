import type { BookmarkInterface, RecipeInterface } from '@/_models/types';

/** The parts of a planner's saved item that the calendar reads. */
export type SavedItem =
	| Pick<BookmarkInterface, '_id' | 'name' | 'url'>
	| Pick<RecipeInterface, '_id' | 'name'>;
