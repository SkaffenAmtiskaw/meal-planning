import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models/planner';

import { addMeal } from './addMeal';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));

vi.mock('@/_models/planner', () => ({
	Planner: {
		findById: vi.fn(),
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

vi.mock('@/_utils/zObjectId', async () => {
	const { z } = await import('zod');
	return { zObjectId: z.string() };
});

const plannerId = new Types.ObjectId().toString();
const savedItemId = new Types.ObjectId().toString();

const validData = {
	plannerId,
	date: '2024-06-15',
	mealName: 'Lunch',
	dishes: [{ name: 'Soup', sourceType: 'none' as const }],
};

const makePlanner = () => ({
	_id: new Types.ObjectId(plannerId),
	calendar: [],
});

describe('addMeal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);
	});

	it('throws ZodError on invalid input', async () => {
		await expect(addMeal({})).rejects.toThrow();
	});

	it('throws ZodError when date is missing', async () => {
		await expect(addMeal({ ...validData, date: undefined })).rejects.toThrow();
	});

	it('throws ZodError when date format is invalid', async () => {
		await expect(
			addMeal({ ...validData, date: 'not-a-date' }),
		).rejects.toThrow();
	});

	it('throws ZodError when mealName is empty', async () => {
		await expect(addMeal({ ...validData, mealName: '' })).rejects.toThrow();
	});

	it('returns Unauthorized when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	it('returns Unauthorized when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	it('returns Planner not found when planner does not exist', async () => {
		vi.mocked(Planner.findById).mockResolvedValueOnce(null);

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	it('pushes to existing day when date already in calendar', async () => {
		const result = await addMeal(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: expect.any(Types.ObjectId), 'calendar.date': '2024-06-15' },
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({ name: 'Lunch' }),
				},
			},
		);
		expect(result.ok).toBe(true);
	});

	it('adds new day when date is not in calendar', async () => {
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 0,
		} as never);

		await addMeal(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledTimes(2);
		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			{ _id: expect.any(Types.ObjectId) },
			{
				$push: {
					calendar: expect.objectContaining({
						date: '2024-06-15',
						meals: [expect.objectContaining({ name: 'Lunch' })],
					}),
				},
			},
		);
	});

	it('returns the updated calendar on success', async () => {
		const calendar = [
			{ date: '2024-06-15', meals: [{ name: 'Lunch', dishes: [] }] },
		];
		vi.mocked(Planner.findById)
			.mockResolvedValueOnce(makePlanner() as never)
			.mockResolvedValueOnce({ calendar } as never);

		const result = await addMeal(validData);

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.calendar).toEqual(calendar);
	});

	it('maps saved source type to ObjectId', async () => {
		await addMeal({
			...validData,
			dishes: [{ name: 'Pasta', sourceType: 'saved', savedId: savedItemId }],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [
							expect.objectContaining({
								source: expect.any(Types.ObjectId),
							}),
						],
					}),
				},
			},
		);
	});

	it('maps text source type to url object when a URL is provided', async () => {
		await addMeal({
			...validData,
			dishes: [
				{
					name: 'Pasta',
					sourceType: 'text',
					sourceText: 'https://example.com',
				},
			],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [
							expect.objectContaining({
								source: { url: 'https://example.com' },
							}),
						],
					}),
				},
			},
		);
	});

	it('maps text source type to ref object when a plain string is provided', async () => {
		await addMeal({
			...validData,
			dishes: [
				{
					name: 'Pasta',
					sourceType: 'text',
					sourceText: 'The Flavor Bible',
				},
			],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [
							expect.objectContaining({
								source: { ref: 'The Flavor Bible' },
							}),
						],
					}),
				},
			},
		);
	});

	it('sets source to undefined when sourceType is none', async () => {
		await addMeal(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [expect.objectContaining({ source: undefined })],
					}),
				},
			},
		);
	});

	it('sets source to undefined when saved sourceType has no savedId', async () => {
		await addMeal({
			...validData,
			dishes: [{ name: 'Pasta', sourceType: 'saved' }],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [expect.objectContaining({ source: undefined })],
					}),
				},
			},
		);
	});

	it('sets source to undefined when text sourceType has no sourceText', async () => {
		await addMeal({
			...validData,
			dishes: [{ name: 'Pasta', sourceType: 'text' }],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [expect.objectContaining({ source: undefined })],
					}),
				},
			},
		);
	});

	it('includes description when provided', async () => {
		await addMeal({ ...validData, description: 'A hearty lunch' });

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						description: 'A hearty lunch',
					}),
				},
			},
		);
	});

	it('omits description when not provided', async () => {
		await addMeal(validData);

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						description: undefined,
					}),
				},
			},
		);
	});

	it('includes dish note when provided', async () => {
		await addMeal({
			...validData,
			dishes: [{ name: 'Pasta', sourceType: 'none', note: 'Extra cheese' }],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [expect.objectContaining({ note: 'Extra cheese' })],
					}),
				},
			},
		);
	});

	it('falls back to empty calendar when updated planner is null', async () => {
		vi.mocked(Planner.findById)
			.mockResolvedValueOnce(makePlanner() as never)
			.mockResolvedValueOnce(null);

		const result = await addMeal(validData);

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.calendar).toEqual([]);
	});
});
