import { z } from 'zod';

// `$`, `$[]`, `$[identifier]` or an index, which each pick out an array element.
const ARRAY_ELEMENT = /^(\$|\$\[\w*\]|\d+)$/;

const unwrap = (schema: z.ZodType): z.ZodType =>
	schema instanceof z.ZodOptional ||
	schema instanceof z.ZodNullable ||
	schema instanceof z.ZodDefault
		? unwrap(schema.unwrap() as z.ZodType)
		: schema;

const step = (schema: z.ZodType, segment: string): z.ZodType | undefined => {
	const inner = unwrap(schema);
	if (inner instanceof z.ZodUnion) {
		const found = (inner.options as z.ZodType[])
			.map((option) => step(option, segment))
			.filter((option) => option !== undefined);
		if (found.length < 2) return found[0];
		return z.union(found);
	}
	if (inner instanceof z.ZodArray) {
		return ARRAY_ELEMENT.test(segment)
			? (inner.element as z.ZodType)
			: undefined;
	}
	if (inner instanceof z.ZodObject && Object.hasOwn(inner.shape, segment)) {
		return inner.shape[segment] as z.ZodType;
	}
	return undefined;
};

/**
 * The part of a schema at a MongoDB update path such as `'saved.$.notes'`. A positional segment steps into an
 * array's element, and a field on a union is checked against every member that has it.
 */
export const schemaAtPath = (schema: z.ZodType, path: string): z.ZodType => {
	let current: z.ZodType | undefined = schema;
	for (const segment of path.split('.')) {
		current = current && step(current, segment);
	}
	if (!current) throw new Error(`No field in the schema at ${path}`);
	return current;
};
