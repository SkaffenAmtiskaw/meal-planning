import { z } from 'zod';

import { schemaAtPath } from './schemaAtPath';

type Fields = Record<string, unknown>;

const parse = (schema: z.ZodType, value: unknown, what: string) => {
	const result = schema.safeParse(value);
	if (!result.success) {
		throw new Error(
			`${what} fails its schema:\n${z.prettifyError(result.error)}`,
			{
				cause: result.error,
			},
		);
	}
	return result.data;
};

const mapFields = (
	fields: Fields,
	check: (path: string, value: unknown) => unknown,
) =>
	Object.fromEntries(
		Object.entries(fields).map(([path, value]) => [path, check(path, value)]),
	);

const hasEach = (value: unknown): value is { $each: unknown[] } =>
	typeof value === 'object' && value !== null && '$each' in value;

const checkSet = (schema: z.ZodType, fields: Fields) =>
	mapFields(fields, (path, value) =>
		parse(schemaAtPath(schema, path), value, `The update to ${path}`),
	);

// The value pushed is an element of the array at the path, or a list of them in `$each`.
const checkPush = (schema: z.ZodType, fields: Fields) =>
	mapFields(fields, (path, value) => {
		const element = schemaAtPath(schema, `${path}.$`);
		const what = `The update to ${path}`;
		if (!hasEach(value)) return parse(element, value, what);
		return { ...value, $each: parse(z.array(element), value.$each, what) };
	});

// A path with a default isn't optional: unsetting it would store a document that lacks the default.
const checkUnset = (schema: z.ZodType, fields: Fields) => {
	for (const path of Object.keys(fields)) {
		const result = schemaAtPath(schema, path).safeParse(undefined);
		if (!result.success || result.data !== undefined) {
			throw new Error(`${path} isn't optional, so it can't be unset`);
		}
	}
	return fields;
};

const checks: Record<string, (schema: z.ZodType, fields: Fields) => Fields> = {
	$set: checkSet,
	$push: checkPush,
	$addToSet: checkPush,
	$unset: checkUnset,
	// $pull only removes, so it can't write a value that breaks the schema.
	$pull: (_, fields) => fields,
};

/** Parses a whole document before it's inserted, so the schema's defaults apply. A failed check throws. */
export const checkInsert = (schema: z.ZodType, document: unknown) =>
	parse(schema, document, 'An insert');

/**
 * Checks each value an update writes against the part of the schema at its path, and returns the update with the
 * parsed values. A failed check, or an operator with no check, throws.
 */
export const checkUpdate = <Update extends object>(
	schema: z.ZodType,
	update: Update,
): Update =>
	Object.fromEntries(
		Object.entries(update).map(([operator, fields]) => {
			const check = Object.hasOwn(checks, operator)
				? checks[operator]
				: undefined;
			if (!check)
				throw new Error(`No check for the update operator ${operator}`);
			return [operator, check(schema, fields as Fields)];
		}),
	) as Update;
