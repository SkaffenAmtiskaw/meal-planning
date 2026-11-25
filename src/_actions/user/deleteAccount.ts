'use server';

import { headers } from 'next/headers';

import { removePlanner } from '@/_actions/_utils/removePlanner';
import { auth } from '@/_auth';
import { deleteAuthUser } from '@/_auth/users';
import { sendAccountDeletionEmail } from '@/_email';
import { users } from '@/_models/database/users';
import type { ActionResult } from '@/_utils/actionResult';

export const deleteAccount = async (): Promise<ActionResult> => {
	const session = await auth.api.getSession({ headers: await headers() });
	if (!session) return { ok: false, error: 'Not authenticated.' };

	const { email } = session.user;

	const user = await users.findOne({ email });
	if (!user) return { ok: false, error: 'User not found.' };

	/**
	 * A planner the user owns or was the only member of goes with them. Any other shared planner stays, and the
	 * user's membership goes with their user document.
	 */
	for (const { planner: plannerId, accessLevel } of user.planners) {
		const goesWithUser =
			accessLevel === 'owner' ||
			(await users.countDocuments({ 'planners.planner': plannerId })) === 1;
		if (goesWithUser) await removePlanner(plannerId);
	}

	await users.deleteOne({ email });

	await deleteAuthUser(auth, email);

	await sendAccountDeletionEmail({ email });

	return { ok: true, data: undefined };
};
