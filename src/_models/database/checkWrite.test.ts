import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { checkInsert, checkUpdate } from './checkWrite';

const zTag = z.object({ _id: z.string(), name: z.string() });

const zDocument = z.object({
	_id: z.string(),
	name: z.string().default('Unnamed'),
	notes: z.string().min(1).optional(),
	tags: z.array(zTag),
	days: z.array(
		z.object({
			date: z.string(),
			meals: z.array(z.object({ _id: z.string(), title: z.string() })),
		}),
	),
});

const tag = { _id: 'tag-1', name: 'Quick' };

describe('checkInsert', () => {
	it('returns the parsed document, with defaults filled in', () => {
		expect(
			checkInsert(zDocument, { _id: 'doc-1', tags: [], days: [] }),
		).toEqual({ _id: 'doc-1', name: 'Unnamed', tags: [], days: [] });
	});

	it('throws when the document breaks the schema', () => {
		expect(() => checkInsert(zDocument, { _id: 'doc-1', tags: [] })).toThrow(
			'An insert fails its schema',
		);
	});
});

describe('checkUpdate', () => {
	describe('$set', () => {
		it('passes a value that fits its path', () => {
			expect(checkUpdate(zDocument, { $set: { notes: 'Some notes' } })).toEqual(
				{ $set: { notes: 'Some notes' } },
			);
		});

		it('checks a value on a nested path', () => {
			expect(() =>
				checkUpdate(zDocument, {
					$set: { 'days.$.meals.$[meal].title': 1 },
				}),
			).toThrow('The update to days.$.meals.$[meal].title fails its schema');
		});

		it('throws when a value breaks its path', () => {
			expect(() => checkUpdate(zDocument, { $set: { notes: '' } })).toThrow(
				'The update to notes fails its schema',
			);
		});

		it('throws on a path the schema lacks', () => {
			expect(() => checkUpdate(zDocument, { $set: { missing: 1 } })).toThrow(
				'No field in the schema at missing',
			);
		});
	});

	describe('$push and $addToSet', () => {
		it.each([
			'$push',
			'$addToSet',
		])('%s checks the value against the array element', (operator) => {
			expect(() =>
				checkUpdate(zDocument, { [operator]: { tags: { name: 'No id' } } }),
			).toThrow('The update to tags fails its schema');
		});

		it('passes an element that fits', () => {
			expect(checkUpdate(zDocument, { $push: { tags: tag } })).toEqual({
				$push: { tags: tag },
			});
		});

		it('checks each value in $each, keeping the other modifiers', () => {
			expect(
				checkUpdate(zDocument, {
					$push: { tags: { $each: [tag], $position: 0 } },
				}),
			).toEqual({ $push: { tags: { $each: [tag], $position: 0 } } });
			expect(() =>
				checkUpdate(zDocument, { $push: { tags: { $each: [tag, {}] } } }),
			).toThrow('The update to tags fails its schema');
		});

		it('checks a push onto a nested array', () => {
			expect(() =>
				checkUpdate(zDocument, {
					$push: { 'days.$.meals': { _id: 'meal-1' } },
				}),
			).toThrow('The update to days.$.meals fails its schema');
		});
	});

	describe('$unset', () => {
		it('allows an optional path', () => {
			expect(checkUpdate(zDocument, { $unset: { notes: '' } })).toEqual({
				$unset: { notes: '' },
			});
		});

		it.each([
			['a required path', 'tags'],
			['a path with a default', 'name'],
		])('throws on %s', (_, path) => {
			expect(() => checkUpdate(zDocument, { $unset: { [path]: '' } })).toThrow(
				`${path} isn't optional, so it can't be unset`,
			);
		});
	});

	it('passes $pull through, since it only removes', () => {
		const update = { $pull: { tags: { _id: 'tag-1' } } };

		expect(checkUpdate(zDocument, update)).toEqual(update);
	});

	it('throws on an operator it has no check for', () => {
		expect(() => checkUpdate(zDocument, { $inc: { count: 1 } })).toThrow(
			'No check for the update operator $inc',
		);
	});
});
