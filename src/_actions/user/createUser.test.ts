import { redirect } from 'next/navigation';

import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { addUser } from '@/_actions';

import { createUser } from './createUser';

vi.mock('@/_actions', () => ({
	addUser: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}));

describe('create user', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('calls addUser with the provided email', async () => {
		const plannerId = new Types.ObjectId();
		vi.mocked(addUser).mockResolvedValue({
			planners: [{ _id: plannerId }],
		} as never);

		await createUser('ariel@sea.com');

		expect(addUser).toHaveBeenCalledWith('ariel@sea.com');
	});

	test('redirects to the correct planner path', async () => {
		const plannerId = new Types.ObjectId();
		vi.mocked(addUser).mockResolvedValue({
			planners: [{ _id: plannerId }],
		} as never);

		await createUser('ariel@sea.com');

		expect(redirect).toHaveBeenCalledWith(`${plannerId}/calendar`);
	});

	test('returns an error object when addUser fails', async () => {
		vi.mocked(addUser).mockRejectedValue(new Error('DB error'));

		const result = await createUser('ariel@sea.com');

		expect(result).toEqual({
			error: 'Failed to create planner. Please try again.',
		});
		expect(redirect).not.toHaveBeenCalled();
	});
});
