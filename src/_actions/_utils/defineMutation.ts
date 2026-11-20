import 'server-only';

import type { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import type { AccessLevel } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';

import { invalidate } from './invalidate';
import type { CacheTags } from './types';

type MutationConfig<Schema extends z.ZodType, Data> = {
	schema: Schema;
	// The planner the input changes, and the access level a member needs to change it.
	access: {
		planner: (input: z.output<Schema>) => string;
		level: AccessLevel;
	};
	// The tags to invalidate once the handler succeeds.
	invalidates: (input: z.output<Schema>) => CacheTags;
	handler: (input: z.output<Schema>) => Promise<ActionResult<Data>>;
};

/**
 * Builds a server action that parses its input, checks the signed-in user's
 * access to the planner, runs the handler and, when it succeeds, invalidates
 * the tags it declares. Invalid input comes back as the schema's first issue
 * message, unreported, since it's expected. Anything the handler throws passes
 * through.
 */
export const defineMutation =
	<Schema extends z.ZodType, Data = undefined>({
		schema,
		access,
		invalidates,
		handler,
	}: MutationConfig<Schema, Data>) =>
	async (data: unknown): Promise<ActionResult<Data>> => {
		const parsed = schema.safeParse(data);
		if (!parsed.success)
			return { ok: false, error: parsed.error.issues[0].message };
		const input = parsed.data;

		// checkAuth has already reported an `error` result.
		const auth = await checkAuth(access.planner(input), access.level);
		if (auth.type !== 'authorized') return { ok: false, error: 'Unauthorized' };

		const result = await handler(input);
		if (result.ok) invalidate(invalidates(input));
		return result;
	};
