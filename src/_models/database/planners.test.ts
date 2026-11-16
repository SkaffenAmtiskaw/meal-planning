import { describe, expect, it, vi } from 'vitest';

import { planners } from './planners';

const { collection } = vi.hoisted(() => ({
	collection: { updateOne: vi.fn() },
}));

vi.mock('./connection', () => ({
	rawDatabase: { collection: vi.fn(() => collection) },
}));

describe('planners', () => {
	it('checks a write against the planner schema', () => {
		expect(() =>
			planners.updateOne({ _id: 'planner-1' }, {
				$push: { tags: { _id: 'tag-1', name: 'Quick', color: 'not-a-color' } },
			} as never),
		).toThrow('The update to tags fails its schema');
	});
});
