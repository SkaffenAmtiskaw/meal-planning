import 'server-only';

import { addPlanner } from '@/_actions/_utils/addPlanner';
import { newId } from '@/_models/database/newId';
import { users } from '@/_models/database/users';
import {
	type AccessLevel,
	DEFAULT_USER_NAME,
	type NewUser,
} from '@/_models/user';

interface AddUserOptions {
	email: string;
	plannerId?: string;
	name?: string;
	skipPlannerCreation?: boolean;
	accessLevel?: AccessLevel;
}

export async function addUser(options: AddUserOptions): Promise<NewUser> {
	const {
		email,
		plannerId,
		name,
		skipPlannerCreation = false,
		accessLevel,
	} = options;

	// Determine planner to use
	let id: string;
	let isNewPlanner: boolean;

	if (plannerId) {
		// Use provided planner
		id = plannerId;
		isNewPlanner = false;
	} else if (skipPlannerCreation) {
		// Error: must have plannerId if skipPlannerCreation is true
		throw new Error('plannerId is required when skipPlannerCreation is true');
	} else {
		// The user's insert gives a missing name the schema's default, so the planner is named with that default too.
		id = (await addPlanner(`${name || DEFAULT_USER_NAME}'s Planner`))._id;
		isNewPlanner = true;
	}

	// Determine access level
	const finalAccessLevel = accessLevel ?? (isNewPlanner ? 'owner' : 'read');

	const user: NewUser = {
		_id: newId(),
		email,
		...(name && { name }),
		planners: [{ _id: newId(), planner: id, accessLevel: finalAccessLevel }],
	};

	await users.insertOne(user);
	return user;
}
