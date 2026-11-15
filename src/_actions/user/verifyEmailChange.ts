'use server';

import { auth } from '@/_auth';
import { changeAuthUserEmail } from '@/_auth/users';
import { User } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';

export const verifyEmailChange = async (
	token: string,
): Promise<ActionResult> => {
	const user = await User.findOne({ 'pendingEmailChange.token': token }).exec();
	const pendingChange = user?.pendingEmailChange;

	if (
		!user ||
		!pendingChange ||
		new Date(pendingChange.expiresAt) <= new Date()
	)
		return { ok: false, error: 'This link is invalid or has expired.' };

	const currentEmail = user.email;
	const newEmail = pendingChange.email;

	await changeAuthUserEmail(auth, currentEmail, newEmail);

	await User.updateOne(
		{ email: currentEmail },
		{ $set: { email: newEmail }, $unset: { pendingEmailChange: '' } },
	);

	return { ok: true, data: undefined };
};
