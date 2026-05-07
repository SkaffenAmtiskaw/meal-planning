import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { userSchema, zUserInterface } from './user';

const plannerId = new Types.ObjectId().toString();
const membership = { planner: plannerId, accessLevel: 'owner' as const };

describe('user interface', () => {
	test('accepts a valid user with a name', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				name: 'Gaston',
				planners: [membership],
			}).success,
		).toBe(true);
	});

	test('defaults name to "New User" when omitted', () => {
		const result = zUserInterface.safeParse({
			email: 'gaston@villainslair.example.com',
			planners: [membership],
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
				planners: [membership],
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
		expect(zUserInterface.safeParse({ planners: [membership] }).success).toBe(
			false,
		);
	});

	test('rejects a user missing planners', () => {
		expect(
			zUserInterface.safeParse({ email: 'gaston@villainslair.example.com' })
				.success,
		).toBe(false);
	});

	test('rejects a planner membership with an invalid planner ObjectId', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: [{ planner: 'bad-id', accessLevel: 'owner' }],
			}).success,
		).toBe(false);
	});

	test('rejects a planner membership with an invalid access level', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: [{ planner: plannerId, accessLevel: 'superuser' }],
			}).success,
		).toBe(false);
	});

	test('defines an index on planners.planner', () => {
		const indexes = userSchema.indexes();
		const plannerIndex = indexes.find(
			([fields]) => fields['planners.planner'] === 1,
		);
		expect(plannerIndex).toBeDefined();
	});
});
