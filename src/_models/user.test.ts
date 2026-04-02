import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zUserInterface } from './user';

const plannerId = new Types.ObjectId().toString();

describe('user interface', () => {
	test('accepts a valid user with a name', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				name: 'Gaston',
				planners: [plannerId],
			}).success,
		).toBe(true);
	});

	test('defaults name to "New User" when omitted', () => {
		const result = zUserInterface.safeParse({
			email: 'gaston@villainslair.example.com',
			planners: [plannerId],
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('New User');
		}
	});

	test('rejects a user with an invalid name', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				name: '$evil',
				planners: [plannerId],
			}).success,
		).toBe(false);
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
