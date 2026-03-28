import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zUserInterface } from './user';

const plannerId = new Types.ObjectId().toString();

describe('user interface', () => {
	test('accepts a valid user', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: [plannerId],
			}).success,
		).toBe(true);
	});

	test('accepts a user with no planners', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: [],
			}).success,
		).toBe(true);
	});

	test('rejects a user missing email', () => {
		expect(zUserInterface.safeParse({ planners: [plannerId] }).success).toBe(
			false,
		);
	});

	test('rejects a user missing planners', () => {
		expect(
			zUserInterface.safeParse({ email: 'gaston@villainslair.example.com' })
				.success,
		).toBe(false);
	});

	test('rejects a user with an invalid planner ObjectId', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: ['bad-id'],
			}).success,
		).toBe(false);
	});
});
