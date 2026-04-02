'use server';

import { hashPassword } from 'better-auth/crypto';
import { z } from 'zod';

import { mongoClient } from '@/_auth';
import { User } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';

export const verifyEmailChangeAndSetPassword = async (
	token: string,
	password: string,
): Promise<ActionResult> => {
	const parsed = z.string().min(8).safeParse(password);
	if (!parsed.success)
		return { ok: false, error: 'Password must be at least 8 characters.' };

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

	const baUser = await db.collection('user').findOne({ email: currentEmail });
	if (!baUser) return { ok: false, error: 'User not found.' };

	const hash = await hashPassword(password);

	await db.collection('account').insertOne({
		userId: baUser._id,
		providerId: 'credential',
		accountId: String(baUser._id),
		password: hash,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await db
		.collection('user')
		.updateOne({ _id: baUser._id }, { $set: { email: newEmail } });

	await User.updateOne(
		{ email: currentEmail },
		{ $set: { email: newEmail }, $unset: { pendingEmailChange: '' } },
	);

	return { ok: true, data: undefined };
};
