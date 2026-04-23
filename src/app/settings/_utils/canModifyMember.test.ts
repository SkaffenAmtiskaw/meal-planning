import { describe, expect, it } from 'vitest';

import type { PlannerMember } from '@/_actions/planner/getPlannerMembers.types';

import { type CanModifyMemberParams, canModifyMember } from './canModifyMember';

describe('canModifyMember', () => {
	const createMember = (
		email: string,
		accessLevel: PlannerMember['accessLevel'],
	): PlannerMember => ({
		name: 'Test User',
		email,
		accessLevel,
	});

	it('returns false when modifying yourself', () => {
		const member = createMember('alice@example.com', 'write');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'alice@example.com',
			currentUserIsOwner: true,
		};

		expect(canModifyMember(params)).toBe(false);
	});

	it('returns false when modifying owner', () => {
		const member = createMember('alice@example.com', 'owner');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'bob@example.com',
			currentUserIsOwner: true,
		};

		expect(canModifyMember(params)).toBe(false);
	});

	it('returns false when admin modifies another admin', () => {
		const member = createMember('charlie@example.com', 'admin');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'bob@example.com',
			currentUserIsOwner: false,
		};

		expect(canModifyMember(params)).toBe(false);
	});

	it('returns true when owner modifies admin', () => {
		const member = createMember('charlie@example.com', 'admin');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'alice@example.com',
			currentUserIsOwner: true,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when owner modifies write user', () => {
		const member = createMember('charlie@example.com', 'write');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'alice@example.com',
			currentUserIsOwner: true,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when owner modifies read user', () => {
		const member = createMember('charlie@example.com', 'read');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'alice@example.com',
			currentUserIsOwner: true,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when admin modifies write user', () => {
		const member = createMember('charlie@example.com', 'write');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'bob@example.com',
			currentUserIsOwner: false,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when admin modifies read user', () => {
		const member = createMember('charlie@example.com', 'read');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'bob@example.com',
			currentUserIsOwner: false,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when currentUserEmail is null', () => {
		const member = createMember('charlie@example.com', 'write');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: null,
			currentUserIsOwner: false,
		};

		expect(canModifyMember(params)).toBe(true);
	});

	it('returns true when modifying different user with write access', () => {
		const member = createMember('charlie@example.com', 'write');
		const params: CanModifyMemberParams = {
			member,
			currentUserEmail: 'bob@example.com',
			currentUserIsOwner: false,
		};

		expect(canModifyMember(params)).toBe(true);
	});
});
