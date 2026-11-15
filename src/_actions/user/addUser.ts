'use server';

import { addPlanner } from '@/_actions/planner';
import { newId } from '@/_models/database/newId';
import type { AccessLevel, UserInterface } from '@/_models/user';
import { User } from '@/_models/user';

export interface AddUserOptions {
	email: string;
	plannerId?: string;
	name?: string;
	skipPlannerCreation?: boolean;
	accessLevel?: AccessLevel;
	emailVerified?: boolean;
}

function isAddUserOptions(arg: unknown): arg is AddUserOptions {
	return typeof arg === 'object' && arg !== null && 'email' in arg;
}

export async function addUser(options: AddUserOptions): Promise<{
	email: string;
	name: string;
	planners: { planner: string; accessLevel: AccessLevel }[];
}>;
export async function addUser(
	email: string,
	plannerId?: string,
	name?: string,
): Promise<{
	email: string;
	name: string;
	planners: { planner: string; accessLevel: AccessLevel }[];
}>;
export async function addUser(
	arg1: AddUserOptions | string,
	arg2?: string,
	arg3?: string,
): Promise<{
	email: string;
	name: string;
	planners: { planner: string; accessLevel: AccessLevel }[];
}> {
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
		name = 'New User',
		skipPlannerCreation = false,
		accessLevel,
		emailVerified,
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
		// Create new planner
		id = (await addPlanner())._id;
		isNewPlanner = true;
	}

	// Determine access level
	const finalAccessLevel = accessLevel ?? (isNewPlanner ? 'owner' : 'read');

	// Build user data object
	const userData: UserInterface & { emailVerified?: boolean } = {
		_id: newId(),
		email,
		name,
		planners: [{ _id: newId(), planner: id, accessLevel: finalAccessLevel }],
	};

	// Only add emailVerified if it was provided
	if (emailVerified !== undefined) {
		userData.emailVerified = emailVerified;
	}

	return await User.create(userData);
}
