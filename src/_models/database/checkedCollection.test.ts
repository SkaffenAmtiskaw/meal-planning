import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Collection } from 'mongodb';
import { z } from 'zod';

import { checkedCollection } from './checkedCollection';

const zDocument = z.object({
	_id: z.string(),
	name: z.string().default('Unnamed'),
});

const collection = {
	countDocuments: vi.fn(),
	deleteMany: vi.fn(),
	deleteOne: vi.fn(),
	find: vi.fn(),
	findOne: vi.fn(),
	insertOne: vi.fn(),
	updateMany: vi.fn(),
	updateOne: vi.fn(),
};

const documents = checkedCollection(
	collection as unknown as Collection<z.output<typeof zDocument>>,
	zDocument,
);

describe('checkedCollection', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('reads many without a check', () => {
		documents.find({ _id: { $in: ['doc-1', 'doc-2'] } });

		expect(collection.find).toHaveBeenCalledWith({
			_id: { $in: ['doc-1', 'doc-2'] },
		});
	});

	it('reads without a check', () => {
		documents.findOne({ _id: 'doc-1' });

		expect(collection.findOne).toHaveBeenCalledWith({ _id: 'doc-1' });
	});

	it('counts without a check', () => {
		documents.countDocuments({ name: 'Named' });

		expect(collection.countDocuments).toHaveBeenCalledWith({ name: 'Named' });
	});

	it('deletes without a check', () => {
		documents.deleteOne({ _id: 'doc-1' });

		expect(collection.deleteOne).toHaveBeenCalledWith({ _id: 'doc-1' });
	});

	it('deletes many without a check', () => {
		documents.deleteMany({ _id: { $in: ['doc-1', 'doc-2'] } });

		expect(collection.deleteMany).toHaveBeenCalledWith({
			_id: { $in: ['doc-1', 'doc-2'] },
		});
	});

	it('inserts the parsed document', () => {
		documents.insertOne({ _id: 'doc-1' });

		expect(collection.insertOne).toHaveBeenCalledWith({
			_id: 'doc-1',
			name: 'Unnamed',
		});
	});

	it('throws before an insert that breaks the schema reaches the collection', () => {
		expect(() => documents.insertOne({} as never)).toThrow(
			'An insert fails its schema',
		);
		expect(collection.insertOne).not.toHaveBeenCalled();
	});

	it('updates with the checked update', () => {
		documents.updateOne({ _id: 'doc-1' }, { $set: { name: 'Named' } });

		expect(collection.updateOne).toHaveBeenCalledWith(
			{ _id: 'doc-1' },
			{ $set: { name: 'Named' } },
			undefined,
		);
	});

	it('throws before an update that breaks the schema reaches the collection', () => {
		expect(() =>
			documents.updateOne({ _id: 'doc-1' }, { $set: { name: 1 } } as never),
		).toThrow('The update to name fails its schema');
		expect(collection.updateOne).not.toHaveBeenCalled();
	});

	it('updates many with the checked update', () => {
		documents.updateMany({ name: 'Unnamed' }, { $set: { name: 'Named' } });

		expect(collection.updateMany).toHaveBeenCalledWith(
			{ name: 'Unnamed' },
			{ $set: { name: 'Named' } },
			undefined,
		);
	});

	it('passes arrayFilters on with a checked update', () => {
		const options = { arrayFilters: [{ 'item._id': 'doc-1' }] };

		documents.updateOne({ _id: 'doc-1' }, { $set: { name: 'Named' } }, options);

		expect(collection.updateOne).toHaveBeenCalledWith(
			{ _id: 'doc-1' },
			{ $set: { name: 'Named' } },
			options,
		);
	});

	it('still checks an update sent with arrayFilters', () => {
		expect(() =>
			documents.updateOne({ _id: 'doc-1' }, { $set: { name: 1 } } as never, {
				arrayFilters: [],
			}),
		).toThrow('The update to name fails its schema');
		expect(collection.updateOne).not.toHaveBeenCalled();
	});

	it('passes arrayFilters on when updating many with a checked update', () => {
		const options = { arrayFilters: [{ 'item._id': 'doc-1' }] };

		documents.updateMany(
			{ name: 'Unnamed' },
			{ $set: { name: 'Named' } },
			options,
		);

		expect(collection.updateMany).toHaveBeenCalledWith(
			{ name: 'Unnamed' },
			{ $set: { name: 'Named' } },
			options,
		);
	});

	it('still checks an update of many sent with arrayFilters', () => {
		expect(() =>
			documents.updateMany(
				{ name: 'Unnamed' },
				{ $set: { name: 1 } } as never,
				{
					arrayFilters: [],
				},
			),
		).toThrow('The update to name fails its schema');
		expect(collection.updateMany).not.toHaveBeenCalled();
	});

	it('throws before an update of many that breaks the schema reaches the collection', () => {
		expect(() =>
			documents.updateMany({ name: 'Unnamed' }, {
				$set: { name: 1 },
			} as never),
		).toThrow('The update to name fails its schema');
		expect(collection.updateMany).not.toHaveBeenCalled();
	});
});
