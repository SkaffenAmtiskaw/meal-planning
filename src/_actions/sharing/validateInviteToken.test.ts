import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PendingInvite, Planner } from '@/_models';

import { validateInviteToken } from './validateInviteToken';

vi.mock('@/_models', () => ({
	PendingInvite: {
		findOne: vi.fn(),
	},
	Planner: {
		findById: vi.fn(),
	},
}));

describe('validateInviteToken', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should return valid=true with email and plannerName for valid token', async () => {
		const mockInvite = {
			email: 'test@example.com',
			planner: { toString: () => 'planner123' },
			expiresAt: new Date(Date.now() + 86400000), // 1 day from now
			deleteOne: vi.fn(),
		};

		const mockPlanner = {
			name: 'Test Planner',
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(Planner.findById).mockResolvedValue(mockPlanner as never);

		const result = await validateInviteToken('valid-token');

		expect(result).toEqual({
			valid: true,
			email: 'test@example.com',
			plannerName: 'Test Planner',
		});
	});

	it('should return valid=false with reason=expired for expired token and delete it', async () => {
		const mockDeleteOne = vi.fn().mockResolvedValue(undefined);
		const mockInvite = {
			email: 'test@example.com',
			planner: { toString: () => 'planner123' },
			expiresAt: new Date(Date.now() - 86400000), // 1 day ago
			deleteOne: mockDeleteOne,
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);

		const result = await validateInviteToken('expired-token');

		expect(result).toEqual({
			valid: false,
			reason: 'expired',
			email: 'test@example.com',
		});
		expect(mockDeleteOne).toHaveBeenCalled();
	});

	it('should return valid=false with reason=invalid for non-existent token', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await validateInviteToken('non-existent-token');

		expect(result).toEqual({
			valid: false,
			reason: 'invalid',
		});
	});

	it('should return valid=false with reason=invalid for malformed token', async () => {
		vi.mocked(PendingInvite.findOne).mockResolvedValue(null);

		const result = await validateInviteToken('');

		expect(result).toEqual({
			valid: false,
			reason: 'invalid',
		});
	});

	it('should include planner name in response when valid', async () => {
		const mockInvite = {
			email: 'test@example.com',
			planner: { toString: () => 'planner123' },
			expiresAt: new Date(Date.now() + 86400000),
			deleteOne: vi.fn(),
		};

		const mockPlanner = {
			name: 'My Special Planner',
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(Planner.findById).mockResolvedValue(mockPlanner as never);

		const result = await validateInviteToken('valid-token');

		expect(result.plannerName).toBe('My Special Planner');
	});

	it('should use default planner name when planner not found', async () => {
		const mockInvite = {
			email: 'test@example.com',
			planner: { toString: () => 'planner123' },
			expiresAt: new Date(Date.now() + 86400000),
			deleteOne: vi.fn(),
		};

		vi.mocked(PendingInvite.findOne).mockResolvedValue(mockInvite as never);
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await validateInviteToken('valid-token');

		expect(result).toEqual({
			valid: true,
			email: 'test@example.com',
			plannerName: 'Meal Planner',
		});
	});

	it('should handle database errors gracefully', async () => {
		vi.mocked(PendingInvite.findOne).mockRejectedValue(new Error('DB Error'));

		const result = await validateInviteToken('valid-token');

		expect(result).toEqual({
			valid: false,
			reason: 'invalid',
		});
	});
});
