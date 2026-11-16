'use server';

import { headers } from 'next/headers';

import { auth } from '@/_auth';
import { sendAccountDeletionEmail } from '@/_auth/emails';
import { deleteAuthUser } from '@/_auth/users';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';
import type { ActionResult } from '@/_utils/actionResult';

export const deleteAccount = async (): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const { email } = session.user;

	const user = await users.findOne({ email });
	if (!user) return { ok: false, error: 'User not found.' };

	// A planner the user was the only member of goes with them; a planner shared with others stays.
	for (const { planner: plannerId } of user.planners) {
		const memberCount = await users.countDocuments({
			'planners.planner': plannerId,
		});
		if (memberCount === 1) {
			await planners.deleteOne({ _id: plannerId });
		}
	}

	await users.deleteOne({ email });

	await deleteAuthUser(auth, email);

	await sendAccountDeletionEmail({ email });

	return { ok: true, data: undefined };
};
