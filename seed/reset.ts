import { auth } from '#auth';
import { deleteAuthUser } from '@/_auth/users';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';

import { SEEDED_USERS } from './users';

// Removes everything the seed made, and what was later done as a seeded user, found from the
// seeded emails so nothing else in the dev database is touched. A seeded user who isn't there
// is skipped, so a run after a partial failure cleans up whatever is left.
export const resetSeed = async () => {
	const emails = SEEDED_USERS.map(({ email }) => email);

	const seededUsers = await users.find({ email: { $in: emails } }).toArray();
	const ownedPlanners = seededUsers.flatMap((user) =>
		user.planners
			.filter(({ accessLevel }) => accessLevel === 'owner')
			.map(({ planner }) => planner),
	);

	await planners.deleteMany({ _id: { $in: ownedPlanners } });

	// Only the membership goes, so the navbar has no dead link and the rest of their doc stays.
	await users.updateMany(
		{ email: { $nin: emails } },
		{ $pull: { planners: { planner: { $in: ownedPlanners } } } },
	);

	await pendingInvites.deleteMany({
		$or: [{ planner: { $in: ownedPlanners } }, { email: { $in: emails } }],
	});

	for (const email of emails) await deleteAuthUser(auth, email);

	// Their memberships in other users' planners go with the doc.
	await users.deleteMany({ email: { $in: emails } });
};
