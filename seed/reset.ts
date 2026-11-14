import { auth } from '#auth';
import { Planner } from '@/_models/planner';
import { PendingInvite } from '@/_models/sharing';
import { User } from '@/_models/user';

import { SEEDED_USERS } from './users';

// Removes everything the seed made, and what was later done as a seeded user, found from the
// seeded emails so nothing else in the dev database is touched. A seeded user who isn't there
// is skipped, so a run after a partial failure cleans up whatever is left.
export const resetSeed = async () => {
	const emails = SEEDED_USERS.map(({ email }) => email);

	const seededUsers = await User.find({ email: { $in: emails } });
	const ownedPlanners = seededUsers.flatMap(({ planners }) =>
		planners
			.filter(({ accessLevel }) => accessLevel === 'owner')
			.map(({ planner }) => planner),
	);

	await Planner.deleteMany({ _id: { $in: ownedPlanners } });

	// Only the membership goes, so the navbar has no dead link and the rest of their doc stays.
	await User.updateMany(
		{ email: { $nin: emails } },
		{ $pull: { planners: { planner: { $in: ownedPlanners } } } },
	);

	await PendingInvite.deleteMany({
		$or: [{ planner: { $in: ownedPlanners } }, { email: { $in: emails } }],
	});

	const { internalAdapter, test } = await auth.$context;
	for (const email of emails) {
		const found = await internalAdapter.findUserByEmail(email);
		// deleteUser also removes the user's sessions and accounts.
		if (found) await test.deleteUser(found.user.id);
	}

	// Their memberships in other users' planners go with the doc.
	await User.deleteMany({ email: { $in: emails } });
};
