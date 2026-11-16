'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { users } from '@/_models/database/users';
import type { ActionResult } from '@/_utils/actionResult';
import { zSafeString } from '@/_utils/zSafeString';

export const updateUserName = async (name: string): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const parsed = zSafeString().safeParse(name);
	if (!parsed.success)
		return { ok: false, error: parsed.error.issues[0].message };

	const { matchedCount } = await users.updateOne(
		{ email: session.user.email },
		{ $set: { name: parsed.data } },
	);
	if (!matchedCount) return { ok: false, error: 'User not found.' };

	return { ok: true, data: undefined };
};
