'use server';

import { headers } from 'next/headers';

import { randomBytes } from 'node:crypto';

import { z } from 'zod';

import { auth, mongoClient } from '@/_auth';
import { sendEmailChangeEmail } from '@/_auth/emails';
import { User } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';
import { env } from '@/env';

const EXPIRY_MS = 24 * 60 * 60 * 1000;

export const requestEmailChange = async (
	newEmail: string,
): Promise<ActionResult<{ hadPreviousRequest: boolean }>> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const currentEmail = session.user.email;

	const parsed = z.string().email().safeParse(newEmail);
	if (!parsed.success)
		return { ok: false, error: 'Please enter a valid email address.' };

	if (newEmail === currentEmail)
		return {
			ok: false,
			error: 'New email must be different from your current email.',
		};

	const db = mongoClient.db();
	const existing = await db.collection('user').findOne({ email: newEmail });
	if (existing)
		return { ok: false, error: 'An account with that email already exists.' };

	const user = await User.findOne({ email: currentEmail }).exec();
	if (!user) return { ok: false, error: 'User not found.' };

	const hadPreviousRequest = !!user.pendingEmailChange;

	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + EXPIRY_MS);

	user.pendingEmailChange = { email: newEmail, token, expiresAt };
	await user.save();

	const url = `${env.BETTER_AUTH_URL}/verify-email-change?token=${token}`;
	await sendEmailChangeEmail({ newEmail, url });

	return { ok: true, data: { hadPreviousRequest } };
};
