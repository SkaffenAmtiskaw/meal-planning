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

function isAddUserOptions(arg: unknown): arg is AddUserOptions {
	return typeof arg === 'object' && arg !== null && 'email' in arg;
}

export async function addUser(options: AddUserOptions): Promise<NewUser>;
export async function addUser(
	email: string,
	plannerId?: string,
	name?: string,
): Promise<NewUser>;
export async function addUser(
	arg1: AddUserOptions | string,
	arg2?: string,
	arg3?: string,
): Promise<NewUser> {
	// Normalize to options object
	let options: AddUserOptions;

	if (isAddUserOptions(arg1)) {
		// New style: options object
		options = arg1;
	} else {
		// Old style: positional args
		options = {
			email: arg1,
			plannerId: arg2,
			name: arg3,
		};
	}

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
		// A user with no name gets the schema's default only at its insert, so the planner uses that default too.
		id = (await addPlanner(`${name || DEFAULT_USER_NAME}'s Planner`))._id;
		isNewPlanner = true;
	}

	// Determine access level
	const finalAccessLevel = accessLevel ?? (isNewPlanner ? 'owner' : 'read');

	// A user with no name gets the schema's default name when it's inserted.
	const user: NewUser = {
		_id: newId(),
		email,
		...(name && { name }),
		planners: [{ _id: newId(), planner: id, accessLevel: finalAccessLevel }],
	};

	await users.insertOne(user);
	return user;
}
