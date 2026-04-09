import { Types } from 'mongoose';
import { describe, expect, test, vi } from 'vitest';

vi.mock('mongoose', async (importOriginal) => {
	const actual = await importOriginal<typeof import('mongoose')>();
	return { ...actual, models: {}, model: vi.fn().mockReturnValue({}) };
});

import { zPlannerInterface } from './planner';

const bookmarkId = new Types.ObjectId().toString();
const recipeId = new Types.ObjectId().toString();
const tagId = new Types.ObjectId().toString();

const validBookmark = {
	_id: bookmarkId,
	name: "Cruella's Fur Coat Lookbook",
	url: 'https://dalmatians.example.com/coats',
	tags: [tagId],
};

const validRecipe = {
	_id: recipeId,
	name: "Jafar's Scarab Soup",
	ingredients: ['scarab wings', 'sand', 'snake venom'],
	instructions: ['Combine under desert sun', 'Serve to unsuspecting guests'],
};

const validTag = { _id: tagId, name: 'Villain Cuisine', color: '#4B0082' };

describe('planner interface', () => {
	test('accepts a valid empty planner', () => {
		expect(
			zPlannerInterface.safeParse({ calendar: [], saved: [], tags: [] })
				.success,
		).toBe(true);
	});

	test('accepts a planner with a name', () => {
		expect(
			zPlannerInterface.safeParse({
				name: "Ursula's Planner",
				calendar: [],
				saved: [],
				tags: [],
			}).success,
		).toBe(true);
	});

	test('accepts a planner without a name', () => {
		expect(
			zPlannerInterface.safeParse({ calendar: [], saved: [], tags: [] })
				.success,
		).toBe(true);
	});

	test('accepts a planner with a bookmark in saved', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [validBookmark],
				tags: [],
			}).success,
		).toBe(true);
	});

	test('accepts a planner with a recipe in saved', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [validRecipe],
				tags: [],
			}).success,
		).toBe(true);
	});

	test('accepts a planner with both recipes and bookmarks in saved', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [validBookmark, validRecipe],
				tags: [],
			}).success,
		).toBe(true);
	});

	test('accepts a planner with tags', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [],
				tags: [validTag],
			}).success,
		).toBe(true);
	});

	test('accepts a planner with calendar entries', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [{ date: '2026-03-27', meals: [] }],
				saved: [],
				tags: [],
			}).success,
		).toBe(true);
	});

	test('rejects a planner missing calendar', () => {
		expect(zPlannerInterface.safeParse({ saved: [], tags: [] }).success).toBe(
			false,
		);
	});

	test('rejects a planner missing saved', () => {
		expect(
			zPlannerInterface.safeParse({ calendar: [], tags: [] }).success,
		).toBe(false);
	});

	test('rejects a planner missing tags', () => {
		expect(
			zPlannerInterface.safeParse({ calendar: [], saved: [] }).success,
		).toBe(false);
	});

	test('rejects a planner with an invalid calendar entry', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [{ date: 'not-a-date' }],
				saved: [],
				tags: [],
			}).success,
		).toBe(false);
	});

	test('rejects a planner with a tag missing color', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [],
				tags: [{ name: 'Villain Cuisine' }],
			}).success,
		).toBe(false);
	});

	test('rejects a saved item that matches neither bookmark nor recipe shape', () => {
		expect(
			zPlannerInterface.safeParse({
				calendar: [],
				saved: [{ _id: bookmarkId, name: 'Mystery Item' }],
				tags: [],
			}).success,
		).toBe(false);
	});
});
