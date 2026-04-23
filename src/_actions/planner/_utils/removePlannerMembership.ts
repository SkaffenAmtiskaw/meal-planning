import type { Types } from 'mongoose';

import { User } from '@/_models';

export interface RemoveMembershipResult {
	ok: boolean;
	error?: string;
}

export const removePlannerMembership = async (
	userId: string | Types.ObjectId,
	plannerId: string | Types.ObjectId,
): Promise<RemoveMembershipResult> => {
	try {
		// Convert plannerId to ObjectId if it's a string
		const plannerObjectId =
			typeof plannerId === 'string'
				? new (await import('mongoose')).Types.ObjectId(plannerId)
				: plannerId;

		// Use $pull to atomically remove the membership
		await User.findByIdAndUpdate(userId, {
			$pull: {
				planners: { planner: plannerObjectId },
			},
		});

		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};
