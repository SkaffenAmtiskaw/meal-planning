'use server';

import { Types } from 'mongoose';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { PendingInvite } from '@/_models';
import { serialize } from '@/_utils/serialize';

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

		// 1. Verify caller is authenticated and has 'admin' access to the planner
		const authResult = await checkAuth(new Types.ObjectId(plannerId), 'admin');

		if (authResult.type !== 'authorized') {
			return { success: false, error: 'Unauthorized' };
		}

		// 2. Validate inviteId is a valid MongoDB ObjectId
		if (!Types.ObjectId.isValid(inviteId)) {
			return { success: false, error: 'Invalid invite ID' };
		}

		// 3. Find the pending invite by _id and planner (to ensure it's for this planner)
		const invite = await PendingInvite.findOne({
			_id: new Types.ObjectId(inviteId),
			planner: new Types.ObjectId(plannerId),
		});

		// 4. If invite not found, return error
		if (!invite) {
			return { success: false, error: 'Invite not found' };
		}

		// 5. Delete the pending invite
		await PendingInvite.deleteOne({
			_id: new Types.ObjectId(inviteId),
		});

		// 6. Return success
		return serialize({ success: true });
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An error occurred',
		};
	}
};
