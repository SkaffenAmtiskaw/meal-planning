import { afterEach, describe, expect, it, vi } from 'vitest';

import { addPlanner } from '@/_actions/_utils/addPlanner';
import { users } from '@/_models/database/users';

import { addUser } from './addUser';

vi.mock(
	'@/_actions/_utils/addPlanner',
	async () => await import('#mocks/@/_actions/_utils/addPlanner'),
);
vi.mock(
	'@/_models/database/users',
	async () => await import('#mocks/@/_models/database/users'),
);
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const mockPlannerId = 'new-planner-id';
const givenNewPlanner = () =>
	vi.mocked(addPlanner).mockResolvedValue({ _id: mockPlannerId } as never);

describe('addUser', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('with options object', () => {
		it('creates a new planner and assigns owner access when no plannerId is provided', async () => {
			givenNewPlanner();

			await addUser({ email: 'cruella@deVil.com' });

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				planners: [
					{ _id: 'new-id', planner: mockPlannerId, accessLevel: 'owner' },
				],
			});
		});

		it('leaves out the name when none is provided, so the insert gives the default', async () => {
			givenNewPlanner();

			await addUser({ email: 'cruella@deVil.com' });

			expect(vi.mocked(users.insertOne).mock.calls[0][0]).not.toHaveProperty(
				'name',
			);
		});

		it('uses the provided plannerId and assigns read access', async () => {
			const existingPlannerId = 'existing-planner-id';

			await addUser({
				email: 'cruella@deVil.com',
				plannerId: existingPlannerId,
			});

			expect(addPlanner).not.toHaveBeenCalled();
			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				planners: [
					{ _id: 'new-id', planner: existingPlannerId, accessLevel: 'read' },
				],
			});
		});

		it('uses a custom name when provided', async () => {
			givenNewPlanner();

			await addUser({ email: 'cruella@deVil.com', name: 'Cruella' });

			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				name: 'Cruella',
				planners: [
					{ _id: 'new-id', planner: mockPlannerId, accessLevel: 'owner' },
				],
			});
		});

		it('uses a custom accessLevel when provided', async () => {
			givenNewPlanner();

			await addUser({ email: 'cruella@deVil.com', accessLevel: 'admin' });

			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				planners: [
					{ _id: 'new-id', planner: mockPlannerId, accessLevel: 'admin' },
				],
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
			givenNewPlanner();

			await addUser('cruella@deVil.com');

			expect(addPlanner).toHaveBeenCalledOnce();
			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				planners: [
					{ _id: 'new-id', planner: mockPlannerId, accessLevel: 'owner' },
				],
			});
		});

		it('normalizes positional arguments with a provided plannerId', async () => {
			const existingPlannerId = 'existing-planner-id';

			await addUser('cruella@deVil.com', existingPlannerId);

			expect(addPlanner).not.toHaveBeenCalled();
			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				planners: [
					{ _id: 'new-id', planner: existingPlannerId, accessLevel: 'read' },
				],
			});
		});

		it('normalizes positional arguments with a custom name', async () => {
			givenNewPlanner();

			await addUser('cruella@deVil.com', undefined, 'Cruella');

			expect(users.insertOne).toHaveBeenCalledWith({
				_id: 'new-id',
				email: 'cruella@deVil.com',
				name: 'Cruella',
				planners: [
					{ _id: 'new-id', planner: mockPlannerId, accessLevel: 'owner' },
				],
			});
		});
	});

	describe('return value', () => {
		it('returns the inserted user', async () => {
			givenNewPlanner();

			const result = await addUser({
				email: 'cruella@deVil.com',
				name: 'Cruella',
			});

			expect(result).toStrictEqual(vi.mocked(users.insertOne).mock.calls[0][0]);
		});
	});

	describe('error handling', () => {
		it('propagates errors from the insert', async () => {
			givenNewPlanner();
			vi.mocked(users.insertOne).mockRejectedValue(new Error('DB error'));

			await expect(addUser({ email: 'cruella@deVil.com' })).rejects.toThrow(
				'DB error',
			);
		});
	});
});
