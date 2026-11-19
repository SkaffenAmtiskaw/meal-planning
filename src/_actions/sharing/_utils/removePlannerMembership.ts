import { users } from '@/_models/database/users';
import { reportError } from '@/_reporting/reportError';

interface RemoveMembershipResult {
	ok: boolean;
	error?: string;
}

export const removePlannerMembership = async (
	userId: string,
	plannerId: string,
): Promise<RemoveMembershipResult> => {
	try {
		// Use $pull to atomically remove the membership
		await users.updateOne(
			{ _id: userId },
			{ $pull: { planners: { planner: plannerId } } },
		);

		return { ok: true };
	} catch (error) {
		await reportError(error);
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};
