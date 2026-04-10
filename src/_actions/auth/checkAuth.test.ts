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

	test('should return unauthenticated if the error is No Valid Session', async () => {
		vi.mocked(catchify).mockResolvedValue([
			undefined,
			new Error('No Valid Session'),
		]);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'unauthenticated',
		});
	});

	test('should return error if there is a non-auth error getting the user', async () => {
		const dbError = new Error('DB connection timeout');
		vi.mocked(catchify).mockResolvedValue([undefined, dbError]);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'error',
			error: dbError,
		});
	});

	test('should return unauthenticated if there is no user', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'unauthenticated',
		});
	});

	test('should return unauthorized if the user does not have access to the planner', async () => {
		const otherPlannerId = new Types.ObjectId();
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: otherPlannerId, accessLevel: 'owner' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'unauthorized',
		});
	});

	test('should return authorized if the user does have access to the planner', async () => {
		const authorizedPlannerId = new Types.ObjectId();

		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: authorizedPlannerId, accessLevel: 'owner' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(authorizedPlannerId, 'read')).toEqual({
			type: 'authorized',
		});
	});

	test('should return unauthorized when access level is below required', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: mockPlannerId, accessLevel: 'read' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId, 'write')).toEqual({
			type: 'unauthorized',
		});
	});

	test('should return authorized when access level meets required', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: mockPlannerId, accessLevel: 'write' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId, 'write')).toEqual({
			type: 'authorized',
		});
	});

	test('should return authorized when access level exceeds required', async () => {
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId, 'admin')).toEqual({
			type: 'authorized',
		});
	});
});
