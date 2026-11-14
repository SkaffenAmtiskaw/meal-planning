import type { AccessLevel } from '@/_models/user';

// One well-known password for every seeded user. It opens nothing outside the dev database.
export const DEV_PASSWORD = 'password';

interface SeededUser {
	key: string;
	name: string;
	email: string;
	// Their access level on the shared planner.
	accessLevel: AccessLevel;
}

export const SEEDED_USERS: SeededUser[] = [
	{
		key: 'owner',
		name: 'Olive Owner',
		email: 'delivered+seed-owner@resend.dev',
		accessLevel: 'owner',
	},
	{
		key: 'admin',
		name: 'Adam Admin',
		email: 'delivered+seed-admin@resend.dev',
		accessLevel: 'admin',
	},
	{
		key: 'write',
		name: 'Wren Writer',
		email: 'delivered+seed-write@resend.dev',
		accessLevel: 'write',
	},
	{
		key: 'read',
		name: 'Reid Reader',
		email: 'delivered+seed-read@resend.dev',
		accessLevel: 'read',
	},
];
