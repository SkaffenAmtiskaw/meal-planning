'use server';

import { mongoClient } from '@/_auth';
import { User } from '@/_models';
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
	const db = mongoClient.db();

	await db
		.collection('user')
		.updateOne({ email: currentEmail }, { $set: { email: newEmail } });

	await User.updateOne(
		{ email: currentEmail },
		{ $set: { email: newEmail }, $unset: { pendingEmailChange: '' } },
	);

	return { ok: true, data: undefined };
};
