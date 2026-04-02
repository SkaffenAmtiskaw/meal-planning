'use server';

import { headers } from 'next/headers';

import { auth, mongoClient } from '@/_auth';
import { sendAccountDeletionEmail } from '@/_auth/emails';
import { Planner, User } from '@/_models';
import type { ActionResult } from '@/_utils/actionResult';

export const deleteAccount = async (): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const { email } = session.user;

	const user = await User.findOne({ email }).exec();
	if (!user) return { ok: false, error: 'User not found.' };

	for (const plannerId of user.planners) {
		const ownerCount = await User.countDocuments({
			planners: plannerId,
		}).exec();
		if (ownerCount === 1) {
			await Planner.deleteOne({ _id: plannerId }).exec();
		}
	}

	await User.deleteOne({ email }).exec();

	const db = mongoClient.db();
	const baUser = await db.collection('user').findOne({ email });
	if (baUser) {
		await db.collection('account').deleteMany({ userId: baUser._id });
		await db.collection('session').deleteMany({ userId: baUser._id });
		await db.collection('verification').deleteMany({ userId: baUser._id });
		await db.collection('user').deleteOne({ _id: baUser._id });
	}

	await sendAccountDeletionEmail({ email });

	return { ok: true, data: undefined };
};
