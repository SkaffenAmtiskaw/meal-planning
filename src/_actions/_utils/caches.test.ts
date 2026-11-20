import { describe, expect, it } from 'vitest';

import { plannerCache, userCache } from './caches';

const plannerId = '507f1f77bcf86cd799439011';
const otherPlannerId = '507f1f77bcf86cd799439012';

describe('plannerCache', () => {
	it.each(
		Object.keys(plannerCache) as Array<keyof typeof plannerCache>,
	)('%s tags one planner, apart from its other data', (name) => {
		const others = Object.entries(plannerCache)
			.filter(([key]) => key !== name)
			.map(([, tag]) => tag(plannerId));

		expect(plannerCache[name](plannerId)).not.toBe(
			plannerCache[name](otherPlannerId),
		);
		expect(others).not.toContain(plannerCache[name](plannerId));
	});
});

describe('userCache', () => {
	it.each(
		Object.keys(userCache) as Array<keyof typeof userCache>,
	)('%s tags one user, apart from their other data', (name) => {
		const others = Object.entries(userCache)
			.filter(([key]) => key !== name)
			.map(([, tag]) => tag('a@example.com'));

		expect(userCache[name]('a@example.com')).not.toBe(
			userCache[name]('b@example.com'),
		);
		expect(others).not.toContain(userCache[name]('a@example.com'));
	});

	it("keeps a user's incoming invites apart from a planner's outgoing ones", () => {
		expect(userCache.invites(plannerId)).not.toBe(
			plannerCache.invites(plannerId),
		);
	});
});
