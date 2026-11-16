'use server';

import { z } from 'zod';

import { auth } from '@/_auth';
import { addAuthUserPassword, changeAuthUserEmail } from '@/_auth/users';
import { users } from '@/_models/database/users';
import type { ActionResult } from '@/_utils/actionResult';

export const verifyEmailChangeAndSetPassword = async (
	token: string,
	password: string,
): Promise<ActionResult> => {
	const parsed = z.string().min(8).safeParse(password);
	if (!parsed.success)
		return { ok: false, error: 'Password must be at least 8 characters.' };

	const user = await users.findOne({ 'pendingEmailChange.token': token });
	const pendingChange = user?.pendingEmailChange;

	if (
		!user ||
		!pendingChange ||
		new Date(pendingChange.expiresAt) <= new Date()
	)
		return { ok: false, error: 'This link is invalid or has expired.' };

	const currentEmail = user.email;
	const newEmail = pendingChange.email;

	if (!(await addAuthUserPassword(auth, currentEmail, password)))
		return { ok: false, error: 'User not found.' };

	await changeAuthUserEmail(auth, currentEmail, newEmail);

	await users.updateOne(
		{ email: currentEmail },
		{ $set: { email: newEmail }, $unset: { pendingEmailChange: '' } },
	);

	return { ok: true, data: undefined };
};
