import type { CacheTag } from './types';

const tag = (...parts: string[]) => parts.join(':') as CacheTag;

/**
 * The cache tag for each part of a planner's data. A read tags every part it
 * includes, and a write invalidates only the parts it changes.
 */
export const plannerCache = {
	calendar: (plannerId: string) => tag('planner', plannerId, 'calendar'),
	saved: (plannerId: string) => tag('planner', plannerId, 'saved'),
	// The planner's recipe tags.
	tags: (plannerId: string) => tag('planner', plannerId, 'tags'),
	// The planner's name.
	details: (plannerId: string) => tag('planner', plannerId, 'details'),
	members: (plannerId: string) => tag('planner', plannerId, 'members'),
	// The invites the planner has sent.
	invites: (plannerId: string) => tag('planner', plannerId, 'invites'),
};

// The cache tag for each part of a user's own data.
export const userCache = {
	profile: (userId: string) => tag('user', userId, 'profile'),
	// The user's planner memberships and access levels.
	planners: (userId: string) => tag('user', userId, 'planners'),
	// The invites sent to an email address.
	invites: (email: string) => tag('invitee', email, 'invites'),
};
