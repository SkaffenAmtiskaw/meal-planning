'use server';

import type { Types } from 'mongoose';

import { addPlanner } from '@/_actions';
import { User } from '@/_models';
import type { AccessLevel } from '@/_models/user';

export interface AddUserOptions {
	email: string;
	plannerId?: Types.ObjectId;
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
	planners: { planner: Types.ObjectId; accessLevel: AccessLevel }[];
}>;
export async function addUser(
	email: string,
	plannerId?: Types.ObjectId,
	name?: string,
): Promise<{
	email: string;
	name: string;
	planners: { planner: Types.ObjectId; accessLevel: AccessLevel }[];
}>;
export async function addUser(
	arg1: AddUserOptions | string,
	arg2?: Types.ObjectId,
	arg3?: string,
): Promise<{
	email: string;
	name: string;
	planners: { planner: Types.ObjectId; accessLevel: AccessLevel }[];
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
	let id: Types.ObjectId;
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
	const userData: {
		email: string;
		name: string;
		planners: { planner: Types.ObjectId; accessLevel: AccessLevel }[];
		emailVerified?: boolean;
	} = {
		email,
		name,
		planners: [{ planner: id, accessLevel: finalAccessLevel }],
	};

	// Only add emailVerified if it was provided
	if (emailVerified !== undefined) {
		userData.emailVerified = emailVerified;
	}

	return await User.create(userData);
}
