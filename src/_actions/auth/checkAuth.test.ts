import { afterEach, describe, expect, test, vi } from 'vitest';

import { getUser } from '@/_actions/user';
import { newId } from '@/_models/database/newId';
import { reportError } from '@/_reporting/reportError';
import { catchify } from '@/_utils/catchify';

import { checkAuth } from './checkAuth';

vi.mock('@/_actions/user', () => ({ getUser: vi.fn() }));
vi.mock('@/_utils/catchify', { spy: true });
vi.mock(
	'@/_reporting/reportError',
	async () => await import('#mocks/@/_reporting/reportError'),
);

const mockPlannerId = newId();

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
		expect(reportError).not.toHaveBeenCalled();
	});

	test('should return error if there is a non-auth error getting the user', async () => {
		const dbError = new Error('DB connection timeout');
		vi.mocked(catchify).mockResolvedValue([undefined, dbError]);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'error',
			error: dbError,
		});
		expect(reportError).toHaveBeenCalledWith(dbError);
	});

	test('should return unauthenticated if there is no user', async () => {
		vi.mocked(getUser).mockResolvedValue(null);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'unauthenticated',
		});
	});

	test('should return unauthorized if the user does not have access to the planner', async () => {
		const otherPlannerId = newId();
		vi.mocked(getUser).mockResolvedValue({
			email: 'test@example.com',
			planners: [{ planner: otherPlannerId, accessLevel: 'owner' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>);

		expect(await checkAuth(mockPlannerId, 'read')).toEqual({
			type: 'unauthorized',
		});
	});

	test('should return authorized with actual accessLevel and user when user has read access and requires read', async () => {
		const authorizedPlannerId = newId();
		const mockUser = {
			email: 'test@example.com',
			planners: [{ planner: authorizedPlannerId, accessLevel: 'read' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>;

		vi.mocked(getUser).mockResolvedValue(mockUser);

		expect(await checkAuth(authorizedPlannerId, 'read')).toEqual({
			type: 'authorized',
			accessLevel: 'read',
			user: mockUser,
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

	test('should return authorized with actual accessLevel and user when access level meets required', async () => {
		const mockUser = {
			email: 'test@example.com',
			planners: [{ planner: mockPlannerId, accessLevel: 'write' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>;

		vi.mocked(getUser).mockResolvedValue(mockUser);

		expect(await checkAuth(mockPlannerId, 'write')).toEqual({
			type: 'authorized',
			accessLevel: 'write',
			user: mockUser,
		});
	});

	test('should return authorized with actual accessLevel and user when owner accesses with admin required', async () => {
		const mockUser = {
			email: 'test@example.com',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
		} as unknown as Awaited<ReturnType<typeof getUser>>;

		vi.mocked(getUser).mockResolvedValue(mockUser);

		expect(await checkAuth(mockPlannerId, 'admin')).toEqual({
			type: 'authorized',
			accessLevel: 'owner',
			user: mockUser,
		});
	});
});
