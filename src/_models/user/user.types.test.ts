import { describe, expect, test } from 'vitest';

import { zUserInterface } from './user.types';

import { newId } from '../database/newId';

const plannerId = newId();
const userId = newId();
const membership = {
	_id: newId(),
	planner: plannerId,
	accessLevel: 'owner' as const,
};

describe('user interface', () => {
	test('accepts a valid user with a name', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
				name: 'Gaston',
				planners: [membership],
			}).success,
		).toBe(true);
	});

	test('defaults name to "New User" when omitted', () => {
		const result = zUserInterface.safeParse({
			_id: userId,
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
				_id: userId,
				email: 'gaston@villainslair.example.com',
				name: '$evil',
				planners: [membership],
			}).success,
		).toBe(false);
	});

	test('accepts a user with no planners', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
				planners: [],
			}).success,
		).toBe(true);
	});

	test('rejects a user missing email', () => {
		expect(
			zUserInterface.safeParse({ _id: userId, planners: [membership] }).success,
		).toBe(false);
	});

	test('rejects a user missing planners', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
			}).success,
		).toBe(false);
	});

	test('rejects a planner membership with an invalid planner id', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
				planners: [{ ...membership, planner: 'bad-id' }],
			}).success,
		).toBe(false);
	});

	test('rejects a planner membership with an invalid access level', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
				planners: [{ ...membership, accessLevel: 'superuser' }],
			}).success,
		).toBe(false);
	});

	test('rejects a user missing _id', () => {
		expect(
			zUserInterface.safeParse({
				email: 'gaston@villainslair.example.com',
				planners: [membership],
			}).success,
		).toBe(false);
	});

	test('rejects a planner membership missing _id', () => {
		expect(
			zUserInterface.safeParse({
				_id: userId,
				email: 'gaston@villainslair.example.com',
				planners: [{ planner: plannerId, accessLevel: 'owner' }],
			}).success,
		).toBe(false);
	});
});
