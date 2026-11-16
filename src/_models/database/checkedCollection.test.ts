import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Collection } from 'mongodb';
import { z } from 'zod';

import { checkedCollection } from './checkedCollection';

const zDocument = z.object({
	_id: z.string(),
	name: z.string().default('Unnamed'),
});

const collection = {
	findOne: vi.fn(),
	insertOne: vi.fn(),
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

	it('reads without a check', () => {
		documents.findOne({ _id: 'doc-1' });

		expect(collection.findOne).toHaveBeenCalledWith({ _id: 'doc-1' });
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
		);
	});

	it('throws before an update that breaks the schema reaches the collection', () => {
		expect(() =>
			documents.updateOne({ _id: 'doc-1' }, { $set: { name: 1 } } as never),
		).toThrow('The update to name fails its schema');
		expect(collection.updateOne).not.toHaveBeenCalled();
	});
});
