import { describe, expect, test } from 'vitest';

import { zPendingInvite } from './pendingInvite.types';

import { newId } from '../database/newId';

const validObjectId = newId();
const inviteId = newId();
const now = new Date();
const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

describe('pending invite', () => {
	test('accepts a valid pending invite with all required fields', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
				createdAt: now,
			}).success,
		).toBe(true);
	});

	test('accepts a pending invite without createdAt (should default to current date)', () => {
		const result = zPendingInvite.safeParse({
			_id: inviteId,
			email: 'guest@example.com',
			planner: validObjectId,
			invitedBy: validObjectId,
			accessLevel: 'read',
			token: 'abc123-uuid-token',
			expiresAt,
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.createdAt).toBeInstanceOf(Date);
		}
	});

	test('rejects a pending invite with an invalid email', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'not-an-email',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite with an invalid planner id', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: 'invalid-id',
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite with an invalid invitedBy id', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: 'invalid-id',
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite with an invalid accessLevel', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'superuser',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite missing the email field', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite missing the token field', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite missing the expiresAt field', () => {
		expect(
			zPendingInvite.safeParse({
				_id: inviteId,
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite missing _id', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt: new Date(),
			}).success,
		).toBe(false);
	});
});
