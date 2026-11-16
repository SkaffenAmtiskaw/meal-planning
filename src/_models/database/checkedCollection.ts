import type {
	Collection,
	Document,
	Filter,
	OptionalUnlessRequiredId,
	UpdateFilter,
} from 'mongodb';
import type { z } from 'zod';

import { checkInsert, checkUpdate } from './checkWrite';

/**
 * A collection whose inserts and updates are checked against its schema, so no caller can write unchecked data.
 * Reads aren't checked, because what's stored was checked on the way in.
 */
export const checkedCollection = <Schema extends z.ZodType<Document>>(
	collection: Collection<z.output<Schema>>,
	schema: Schema,
) => ({
	find: (filter: Filter<z.output<Schema>>) => collection.find(filter),
	findOne: (filter: Filter<z.output<Schema>>) => collection.findOne(filter),
	insertOne: (document: z.input<Schema>) =>
		collection.insertOne(
			checkInsert(schema, document) as OptionalUnlessRequiredId<
				z.output<Schema>
			>,
		),
	updateOne: (
		filter: Filter<z.output<Schema>>,
		update: UpdateFilter<z.output<Schema>>,
	) => collection.updateOne(filter, checkUpdate(schema, update)),
});
