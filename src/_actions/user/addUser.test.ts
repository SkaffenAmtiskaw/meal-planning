import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { addPlanner } from '@/_actions';
import { User } from '@/_models';

import { addUser } from './addUser';

vi.mock('@/_actions', () => ({
	addPlanner: vi.fn(),
}));

vi.mock('@/_models', () => ({
	User: {
		create: vi.fn(),
	},
}));

const mockPlannerId = new Types.ObjectId();

const mockPlanner = { _id: mockPlannerId };

const mockUser = {
	email: 'cruella@deVil.com',
	name: 'Cruella',
	planners: [mockPlannerId],
};

describe('add user', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	// EXISTING TESTS - old signature (must still pass)
	test('should create a new planner when no plannerId is provided', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com');

		expect(addPlanner).toHaveBeenCalledOnce();
		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			name: 'New User',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
		});
	});

	test('should use the provided plannerId without creating a new planner', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com', existingPlannerId);

		expect(addPlanner).not.toHaveBeenCalled();
		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			name: 'New User',
			planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
		});
	});

	test('should use the provided name when given', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com', undefined, 'Cruella');

		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			name: 'Cruella',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
		});
	});

	test('should default name to "New User" when not provided', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com');

		expect(User.create).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'New User' }),
		);
	});

	test('should return the created user', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		const result = await addUser('cruella@deVil.com');

		expect(result).toBe(mockUser);
	});

	test('should throw when User.create fails', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockRejectedValue(new Error('DB error'));

		await expect(addUser('cruella@deVil.com')).rejects.toThrow('DB error');
	});

	// NEW TESTS for options object
	test('should support options object with email only', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser({ email: 'cruella@deVil.com' });

		expect(addPlanner).toHaveBeenCalledOnce();
		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			name: 'New User',
			planners: [{ planner: mockPlannerId, accessLevel: 'owner' }],
		});
	});

	test('should skip planner creation when skipPlannerCreation=true', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

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

	test('should use custom accessLevel when provided', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

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

	test('should pass emailVerified to User.create when provided', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

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

	test('should combine skipPlannerCreation with custom accessLevel', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

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

	test('should combine skipPlannerCreation with emailVerified', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

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

	test('should use plannerId with skipPlannerCreation=true', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser({
			email: 'cruella@deVil.com',
			plannerId: existingPlannerId,
			skipPlannerCreation: true,
		});

		expect(addPlanner).not.toHaveBeenCalled();
		expect(User.create).toHaveBeenCalledWith(
			expect.objectContaining({
				planners: [{ planner: existingPlannerId, accessLevel: 'read' }],
			}),
		);
	});

	test('should throw if skipPlannerCreation=true but no plannerId provided', async () => {
		await expect(
			addUser({
				email: 'cruella@deVil.com',
				skipPlannerCreation: true,
			}),
		).rejects.toThrow('plannerId is required when skipPlannerCreation is true');
	});
});
