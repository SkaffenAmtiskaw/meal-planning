'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { sendAccountDeletionEmail } from '@/_auth/emails';
import { deleteAuthUser } from '@/_auth/users';
import { Planner } from '@/_models/planner';
import { User } from '@/_models/user';
import type { ActionResult } from '@/_utils/actionResult';

export const deleteAccount = async (): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const { email } = session.user;

	const user = await User.findOne({ email }).exec();
	if (!user) return { ok: false, error: 'User not found.' };

	// A planner the user was the only member of goes with them; a planner shared with others stays.
	for (const { planner: plannerId } of user.planners) {
		const memberCount = await User.countDocuments({
			'planners.planner': plannerId,
		}).exec();
		if (memberCount === 1) {
			await Planner.deleteOne({ _id: plannerId }).exec();
		}
	}

	await User.deleteOne({ email }).exec();

	await deleteAuthUser(auth, email);

	await sendAccountDeletionEmail({ email });

	return { ok: true, data: undefined };
};
