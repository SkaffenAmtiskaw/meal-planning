import { auth } from '#auth';
import { deleteAuthUser } from '@/_auth/users';
import { pendingInvites } from '@/_models/database/pendingInvites';
import { planners } from '@/_models/database/planners';
import { users } from '@/_models/database/users';

import { emailStartingWith, SEED_EMAIL_PREFIX, SEEDED_USERS } from './users';

const seededEmail = emailStartingWith(SEED_EMAIL_PREFIX);

// Removes everything the seed and story data files made, and what was later done as one of their
// users, found by the seeded email prefix so nothing else in the dev database is touched. A seeded
// user who isn't there is skipped, so a run after a partial failure cleans up whatever is left.
export const resetSeed = async () => {
	const seededUsers = await users.find({ email: seededEmail }).toArray();
	// The generic seed's emails are listed too, so a better-auth user left without a User doc by a
	// failed run still goes.
	const emails = [
		...new Set([
			...SEEDED_USERS.map(({ email }) => email),
			...seededUsers.map(({ email }) => email),
		]),
	];

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
		$or: [{ planner: { $in: ownedPlanners } }, { email: seededEmail }],
	});

	for (const email of emails) await deleteAuthUser(auth, email);

	// Their memberships in other users' planners go with the doc.
	await users.deleteMany({ email: { $in: emails } });
};
