import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { getUser } from '@/_actions';
import { catchify } from '@/_utils/catchify';

import { checkAuth } from './checkAuth';

vi.mock('@/_actions', () => ({ getUser: vi.fn() }));
vi.mock('@/_utils/catchify', { spy: true });

const mockPlannerId = new Types.ObjectId();

describe('check auth', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should return false if there is an error getting the user', async () => {
		vi.mocked(catchify).mockResolvedValue([undefined, new Error('foo')]);

		expect(await checkAuth(mockPlannerId)).toBe(false);
	});

	test('should return false if there is no user', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		expect(await checkAuth(mockPlannerId)).toBe(false);
	});

	test('should return false if the user does not have access to the planner', async () => {
		const otherPlannerId = new Types.ObjectId();
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [otherPlannerId],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId)).toBe(false);
	});

	test('should return true if the user does have access to the planner', async () => {
		const authorizedPlannerId = new Types.ObjectId();

		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [authorizedPlannerId],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(authorizedPlannerId)).toBe(true);
	});
});
