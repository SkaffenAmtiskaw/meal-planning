import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { addPlanner } from '@/_actions/planner';
import { User } from '@/_models/user';

import { addUser } from './addUser';

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

vi.mock('@/_models/user', async () => await import('@mocks/@/_models/user'));

describe('addUser', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('with options object', () => {
		it('creates a new planner and assigns owner access when no plannerId is provided', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com' });

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('uses the provided plannerId and assigns read access', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser({
				email: 'cruella@deVil.com',
				plannerId: existingPlannerId,
			});

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
			});
		});

		it('uses a custom name when provided', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com', name: 'Cruella' });

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'Cruella',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('uses a custom accessLevel when provided', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com', accessLevel: 'admin' });

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'admin' }],
			});
		});

		it('includes emailVerified when provided', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com', emailVerified: true });

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
				emailVerified: true,
			});
		});

		it('excludes emailVerified when not provided', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com' });

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('throws when skipPlannerCreation is true without a plannerId', async () => {
			await expect(
				addUser({
					email: 'cruella@deVil.com',
					skipPlannerCreation: true,
				}),
			).rejects.toThrow(
				'plannerId is required when skipPlannerCreation is true',
			);
		});
	});

	describe('with positional arguments', () => {
		it('normalizes positional arguments and creates a new planner', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser('cruella@deVil.com');

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('normalizes positional arguments with a provided plannerId', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser('cruella@deVil.com', existingPlannerId);

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
			});
		});

		it('normalizes positional arguments with a custom name', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser('cruella@deVil.com', undefined, 'Cruella');

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'Cruella',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});
	});

	describe('return value', () => {
		it('returns the created user', async () => {
			const mockPlannerId = new Types.ObjectId();
			const mockUser = {
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' as const }],
			};

			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);
			vi.mocked(User.create).mockResolvedValue(mockUser as never);

			const result = await addUser({ email: 'cruella@deVil.com' });

			expect(result).toBe(mockUser);
		});
	});

	describe('error handling', () => {
		it('propagates errors from User.create', async () => {
			const mockPlannerId = new Types.ObjectId();
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);
			vi.mocked(User.create).mockRejectedValue(new Error('DB error'));

			await expect(addUser({ email: 'cruella@deVil.com' })).rejects.toThrow(
				'DB error',
			);
		});
	});
});
