'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { User } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';
import { zSafeString } from '@/_utils/zSafeString';

export const updateUserName = async (name: string): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const parsed = zSafeString().safeParse(name);
	if (!parsed.success)
		return { ok: false, error: parsed.error.issues[0].message };

	const user = await User.findOne({ email: session.user.email }).exec();
	if (!user) return { ok: false, error: 'User not found.' };

	user.name = parsed.data;
	await user.save();

	return { ok: true, data: undefined };
};
