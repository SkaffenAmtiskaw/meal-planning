'use server';

import { getUser } from '@/_actions/user';
import { isNoSessionError } from '@/_actions/user/noSessionError';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { reportError } from '@/_reporting/reportError';
import type { ActionResult } from '@/_utils/actionResult';
import { zId } from '@/_utils/zId';

import type { DeclineInviteInput } from './types';

export const declineInvite = async (
	input: DeclineInviteInput,
): Promise<ActionResult<void>> => {
	try {
		const { inviteId } = input;

		// 1. Get the current authenticated user
		const user = await getUser();

		// 2. If user is not authenticated, return error
		if (!user) {
			return { ok: false, error: 'Unauthorized' };
		}

		// 3. Validate inviteId has the shape of an id
		if (!zId.safeParse(inviteId).success) {
			return { ok: false, error: 'Invalid invite ID' };
		}

		// 4. Find the pending invite by _id
		const invite = await pendingInvites.findOne({
			_id: inviteId,
		});

		// 5. If invite not found, return error
		if (!invite) {
			return { ok: false, error: 'Invite not found' };
		}

		// 6. Verify the invite email matches the authenticated user's email
		if (invite.email !== user.email) {
			return { ok: false, error: 'Unauthorized' };
		}

		// 7. Delete the pending invite
		await pendingInvites.deleteOne({
			_id: inviteId,
		});

		// 8. Return success
		return { ok: true, data: undefined };
	} catch (error) {
		if (!isNoSessionError(error)) await reportError(error);
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
