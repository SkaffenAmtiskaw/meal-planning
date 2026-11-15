import { User } from '@/_models/user';
import { reportError } from '@/_utils/reportError';

export interface RemoveMembershipResult {
	ok: boolean;
	error?: string;
}

export const removePlannerMembership = async (
	userId: string,
	plannerId: string,
): Promise<RemoveMembershipResult> => {
	try {
		// Use $pull to atomically remove the membership
		await User.findByIdAndUpdate(userId, {
			$pull: {
				planners: { planner: plannerId },
			},
		});

		return { ok: true };
	} catch (error) {
		await reportError(error);
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};
