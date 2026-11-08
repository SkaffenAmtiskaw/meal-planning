'use server';

import { Types } from 'mongoose';

import { getUser } from '@/_actions/user';
import { PendingInvite } from '@/_models/sharing';
import type { ActionResult } from '@/_utils/actionResult/ActionResult';
import { reportError } from '@/_utils/reportError';
import { serialize } from '@/_utils/serialize';

export interface DeclineInviteInput {
	inviteId: string;
}

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

		// 3. Validate inviteId is a valid MongoDB ObjectId
		if (!Types.ObjectId.isValid(inviteId)) {
			return { ok: false, error: 'Invalid invite ID' };
		}

		// 4. Find the pending invite by _id
		const invite = await PendingInvite.findOne({
			_id: new Types.ObjectId(inviteId),
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
		await PendingInvite.deleteOne({
			_id: new Types.ObjectId(inviteId),
		});

		// 8. Return success
		return serialize({ ok: true, data: undefined });
	} catch (error) {
		// getUser throws 'No Valid Session' for a signed-out caller, which is expected
		if (!(error instanceof Error && error.message === 'No Valid Session')) {
			await reportError(error);
		}
		return {
			ok: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
