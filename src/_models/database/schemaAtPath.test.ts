import { describe, expect, it } from 'vitest';

import { z } from 'zod';

import { schemaAtPath } from './schemaAtPath';

const zItem = z.object({ _id: z.string(), name: z.string() });
const zOtherItem = z.object({ _id: z.string(), url: z.url() });

const zDocument = z.object({
	name: z.string().optional(),
	items: z.array(zItem),
	mixed: z.array(z.union([zItem, zOtherItem])),
	nested: z.object({ deep: z.array(z.object({ list: z.array(z.string()) })) }),
	maybe: z.object({ inner: z.string() }).optional(),
});

describe('schemaAtPath', () => {
	it('finds a top-level field', () => {
		expect(schemaAtPath(zDocument, 'items')).toBe(zDocument.shape.items);
	});

	it('keeps the field optional at the end of the path', () => {
		expect(schemaAtPath(zDocument, 'name').safeParse(undefined).success).toBe(
			true,
		);
	});

	it.each([
		'$',
		'$[]',
		'$[id]',
		'0',
		'12',
	])('steps into an array element through %s', (segment) => {
		expect(schemaAtPath(zDocument, `items.${segment}.name`)).toBe(
			zItem.shape.name,
		);
	});

	it('follows a nested path through several arrays', () => {
		const schema = schemaAtPath(zDocument, 'nested.deep.$[d].list.$');

		expect(schema.safeParse('text').success).toBe(true);
		expect(schema.safeParse(1).success).toBe(false);
	});

	it('steps through an optional object', () => {
		expect(schemaAtPath(zDocument, 'maybe.inner')).toBe(
			zDocument.shape.maybe.unwrap().shape.inner,
		);
	});

	it('takes the one union member that has the field', () => {
		const schema = schemaAtPath(zDocument, 'mixed.$.url');

		expect(schema.safeParse('https://example.com').success).toBe(true);
		expect(schema.safeParse('not a url').success).toBe(false);
	});

	it('accepts a value any union member with the field accepts', () => {
		const schema = schemaAtPath(zDocument, 'mixed.$._id');

		expect(schema.safeParse('an-id').success).toBe(true);
		expect(schema.safeParse(1).success).toBe(false);
	});

	it.each([
		['a field the schema lacks', 'missing'],
		['a field no union member has', 'mixed.$.missing'],
		['a named step into an array', 'items.name'],
		['a positional step into an object', 'nested.$'],
		['a step past a plain value', 'items.$.name.length'],
		['an inherited property', 'constructor'],
	])('throws on %s', (_, path) => {
		expect(() => schemaAtPath(zDocument, path)).toThrow(
			`No field in the schema at ${path}`,
		);
	});
});
