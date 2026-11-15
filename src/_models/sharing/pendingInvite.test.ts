import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zPendingInvite } from './pendingInvite';

import { newId } from '../database/newId';

const inviteId = newId();
const plannerId = newId();
const invitedById = newId();

describe('pendingInvite interface', () => {
	test('accepts a valid pending invite', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
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
				_id: inviteId,
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
				_id: inviteId,
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
				_id: inviteId,
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
				_id: inviteId,
				email: 'not-an-email',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects invalid planner id', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@villainslair.example.com',
				planner: 'bad-id',
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});

	test('rejects invalid invitedBy id', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
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
				_id: inviteId,
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
				_id: inviteId,
				email: 'guest@villainslair.example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123token',
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite missing _id', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@example.com',
				planner: plannerId,
				invitedBy: invitedById,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});
});
