import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zPendingInvite } from './pendingInvite';

const plannerId = new Types.ObjectId().toString();
const invitedById = new Types.ObjectId().toString();

describe('pendingInvite interface', () => {
	test('accepts a valid pending invite', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(true);
	});

	test('accepts all valid access levels', () => {
		const accessLevels = ['owner', 'admin', 'write', 'read'] as const;
		for (const accessLevel of accessLevels) {
			const result = zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel,
				token: 'abc123token',
				expiresAt: new Date(),
			});
			expect(result.success).toBe(true);
		}
	});

	test('rejects invalid access level', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'superuser',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects missing email', () => {
		expect(
			zPendingInvite.safeParse({
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects invalid email format', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'not-an-email',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects invalid planner ObjectId', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: 'bad-id',
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects invalid invitedBy ObjectId', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: 'bad-id',
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects missing token', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects missing expiresAt', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
			}).success,
		).toBe(false);
	});
});
