import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { addPlanner } from '@/_actions/planner';
import { User } from '@/_models/user';

import { addUser } from './addUser';

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

vi.mock('@/_models/user', () => ({
	User: {
		create: vi.fn(),
	},
}));
const mockPlannerId = new Types.ObjectId();

describe('addUser', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('old signature (positional args)', () => {
		it('should create a new planner when no plannerId is provided', async () => {
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser('cruella@deVil.com');

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('should use the provided plannerId without creating a new planner', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser('cruella@deVil.com', existingPlannerId);

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
			});
		});

		it('should use the provided name when given', async () => {
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser('cruella@deVil.com', undefined, 'Cruella');

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'Cruella',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});
	});

	describe('new signature (options object)', () => {
		it('should support options object with email only', async () => {
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({ email: 'cruella@deVil.com' });

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
			});
		});

		it('should skip planner creation when skipPlannerCreation=true', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser({
				email: 'cruella@deVil.com',
				plannerId: existingPlannerId,
				skipPlannerCreation: true,
			});

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
			});
		});

		it('should use custom accessLevel when provided', async () => {
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({
				email: 'cruella@deVil.com',
				accessLevel: 'admin',
			});

			expect(User.create).toHaveBeenCalledWith(
				expect.objectContaining({
					planners: [{ planner: mockPlannerId, accessLevel: 'admin' }],
				}),
			);
		});

		it('should pass emailVerified to User.create when provided', async () => {
			vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

			await addUser({
				email: 'cruella@deVil.com',
				emailVerified: true,
			});

			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
				emailVerified: true,
			});
		});

		it('should combine skipPlannerCreation with custom accessLevel', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser({
				email: 'cruella@deVil.com',
				plannerId: existingPlannerId,
				skipPlannerCreation: true,
				accessLevel: 'write',
			});

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'write' }],
			});
		});

		it('should combine skipPlannerCreation with emailVerified', async () => {
			const existingPlannerId = new Types.ObjectId();

			await addUser({
				email: 'cruella@deVil.com',
				plannerId: existingPlannerId,
				skipPlannerCreation: true,
				emailVerified: false,
			});

			expect(addPlanner).not.toHaveBeenCalled();
			expect(User.create).toHaveBeenCalledWith({
				email: 'cruella@deVil.com',
				name: 'New User',
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
				emailVerified: false,
			});
		});

		it('should throw if skipPlannerCreation=true but no plannerId provided', async () => {
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

	it('should return the created user', async () => {
		const mockUser = {
			email: 'cruella@deVil.com',
			name: 'New User',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' as const }],
		};

		vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		const result = await addUser('cruella@deVil.com');

		expect(result).toBe(mockUser);
	});

	it('should throw when User.create fails', async () => {
		vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);
		vi.mocked(User.create).mockRejectedValue(new Error('DB error'));

		await expect(addUser('cruella@deVil.com')).rejects.toThrow('DB error');
	});
});
