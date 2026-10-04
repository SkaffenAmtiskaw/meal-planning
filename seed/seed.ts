import { createPlanner } from '#factories/planner';
import { createUser } from '#factories/user';

import { closeDevDatabase, connectDevDatabase } from './devDatabase';
import { DEV_PASSWORD, SEEDED_USERS } from './users';

await connectDevDatabase();

const sharedPlanner = await createPlanner({ name: 'Seeded Shared Planner' });

for (const { name, email, accessLevel } of SEEDED_USERS) {
	const [firstName] = name.split(' ');
	const personalPlanner = await createPlanner({
		name: `${firstName}'s Planner`,
	});

	await createUser({
		email,
		name,
		password: DEV_PASSWORD,
		// The shared planner comes first, so the home page lands them there.
		planners: [
			{ planner: sharedPlanner._id, accessLevel },
			{ planner: personalPlanner._id, accessLevel: 'owner' },
		],
	});
}

await closeDevDatabase();

const nameWidth = Math.max(...SEEDED_USERS.map(({ name }) => name.length));
const levelWidth = Math.max(
	...SEEDED_USERS.map(({ accessLevel }) => accessLevel.length),
);

console.log(`Seeded users (password: ${DEV_PASSWORD}):`);
for (const { name, email, accessLevel } of SEEDED_USERS) {
	console.log(
		`  ${accessLevel.padEnd(levelWidth)}  ${name.padEnd(nameWidth)}  ${email}`,
	);
}
