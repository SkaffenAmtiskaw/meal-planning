'use server';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { reportError } from '@/_utils/reportError';
import { serialize } from '@/_utils/serialize';
import { zId } from '@/_utils/zId';

export interface CancelInviteInput {
	inviteId: string;
	plannerId: string;
}

export interface CancelInviteResult {
	success: boolean;
	error?: string;
}

export const cancelInvite = async (
	input: CancelInviteInput,
): Promise<CancelInviteResult> => {
	try {
		const { inviteId, plannerId } = input;

		if (!zId.safeParse(plannerId).success) {
			return { success: false, error: 'Invalid planner ID' };
		}

		// 1. Verify caller is authenticated and has 'admin' access to the planner
		const authResult = await checkAuth(plannerId, 'admin');

		if (authResult.type !== 'authorized') {
			return { success: false, error: 'Unauthorized' };
		}

		// 2. Validate inviteId has the shape of an id
		if (!zId.safeParse(inviteId).success) {
			return { success: false, error: 'Invalid invite ID' };
		}

		// 3. Find the pending invite by _id and planner (to ensure it's for this planner)
		const invite = await pendingInvites.findOne({
			_id: inviteId,
			planner: plannerId,
		});

		// 4. If invite not found, return error
		if (!invite) {
			return { success: false, error: 'Invite not found' };
		}

		// 5. Delete the pending invite
		await pendingInvites.deleteOne({
			_id: inviteId,
		});

		// 6. Return success
		return serialize({ success: true });
	} catch (error) {
		await reportError(error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
