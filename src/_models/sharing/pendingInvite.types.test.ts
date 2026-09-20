import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zPendingInvite } from './pendingInvite.types';

const validObjectId = new Types.ObjectId().toString();
const now = new Date();
const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

describe('pending invite', () => {
	test('accepts a valid pending invite with all required fields', () => {
		expect(
			zPendingInvite.safeParse({
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
				email: 'not-an-email',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite with an invalid planner ObjectId', () => {
		expect(
			zPendingInvite.safeParse({
				email: 'guest@example.com',
				planner: 'invalid-id',
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
				expiresAt,
			}).success,
		).toBe(false);
	});

	test('rejects a pending invite with an invalid invitedBy ObjectId', () => {
		expect(
			zPendingInvite.safeParse({
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
				email: 'guest@example.com',
				planner: validObjectId,
				invitedBy: validObjectId,
				accessLevel: 'read',
				token: 'abc123-uuid-token',
			}).success,
		).toBe(false);
	});
});
