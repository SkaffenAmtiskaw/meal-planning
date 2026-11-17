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
 * Reads aren't checked, because what's stored was checked on the way in, and deletes only remove.
 */
export const checkedCollection = <Schema extends z.ZodType<Document>>(
	collection: Collection<z.output<Schema>>,
	schema: Schema,
) => ({
	countDocuments: (filter: Filter<z.output<Schema>>) =>
		collection.countDocuments(filter),
	deleteMany: (filter: Filter<z.output<Schema>>) =>
		collection.deleteMany(filter),
	deleteOne: (filter: Filter<z.output<Schema>>) => collection.deleteOne(filter),
	find: (filter: Filter<z.output<Schema>>) => collection.find(filter),
	findOne: (filter: Filter<z.output<Schema>>) => collection.findOne(filter),
	insertOne: (document: z.input<Schema>) =>
		collection.insertOne(
			checkInsert(schema, document) as OptionalUnlessRequiredId<
				z.output<Schema>
			>,
		),
	updateMany: (
		filter: Filter<z.output<Schema>>,
		update: UpdateFilter<z.output<Schema>>,
	) => collection.updateMany(filter, checkUpdate(schema, update)),
	updateOne: (
		filter: Filter<z.output<Schema>>,
		update: UpdateFilter<z.output<Schema>>,
	) => collection.updateOne(filter, checkUpdate(schema, update)),
});
