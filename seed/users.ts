import type { AccessLevel } from '@/_models/user';

// One well-known password for every seeded user. It opens nothing outside the dev database.
export const DEV_PASSWORD = 'password';

// Every user the seed or a story's data file creates has an email starting with this, which is how
// the reset finds them.
export const SEED_EMAIL_PREFIX = 'delivered+seed-';

export const storyEmailPrefix = (story: string) =>
	`${SEED_EMAIL_PREFIX}${story}-`;

// The email of a user a story's data file creates, such as `delivered+seed-zero-planners-crash-new@resend.dev`.
export const storyUserEmail = (story: string, label: string) =>
	`${storyEmailPrefix(story)}${label}@resend.dev`;

// A query filter matching every email that starts with the prefix.
export const emailStartingWith = (prefix: string) => ({
	$regex: `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
});

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
