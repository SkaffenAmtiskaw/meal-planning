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
	planners: [mockPlannerId],
};

describe('add user', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('should create a new planner when no plannerId is provided', async () => {
		vi.mocked(addPlanner).mockResolvedValue(mockPlanner as never);
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com');

		expect(addPlanner).toHaveBeenCalledOnce();
		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			planners: [mockPlannerId],
		});
	});

	test('should use the provided plannerId without creating a new planner', async () => {
		const existingPlannerId = new Types.ObjectId();
		vi.mocked(User.create).mockResolvedValue(mockUser as never);

		await addUser('cruella@deVil.com', existingPlannerId);

		expect(addPlanner).not.toHaveBeenCalled();
		expect(User.create).toHaveBeenCalledWith({
			email: 'cruella@deVil.com',
			planners: [existingPlannerId],
		});
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
});
