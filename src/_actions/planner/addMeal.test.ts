import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { addMeal } from './addMeal';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	Planner: {
		findById: vi.fn(),
		collection: {
			updateOne: vi.fn(),
		},
	},
}));

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
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('throws ZodError on invalid input', async () => {
		await expect(addMeal({})).rejects.toThrow();
	});

	test('throws ZodError when date is missing', async () => {
		await expect(addMeal({ ...validData, date: undefined })).rejects.toThrow();
	});

	test('throws ZodError when date format is invalid', async () => {
		await expect(
			addMeal({ ...validData, date: 'not-a-date' }),
		).rejects.toThrow();
	});

	test('throws ZodError when mealName is empty', async () => {
		await expect(addMeal({ ...validData, mealName: '' })).rejects.toThrow();
	});

	test('returns Unauthorized when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValueOnce(null);

		const result = await addMeal(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('pushes to existing day when date already in calendar', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValueOnce({
			matchedCount: 1,
		} as never);

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

	test('adds new day when date is not in calendar', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
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

	test('returns the updated calendar on success', async () => {
		const calendar = [
			{ date: '2024-06-15', meals: [{ name: 'Lunch', dishes: [] }] },
		];
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById)
			.mockResolvedValueOnce(makePlanner() as never)
			.mockResolvedValueOnce({ calendar } as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const result = await addMeal(validData);

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.calendar).toEqual(calendar);
	});

	test('maps saved source type to ObjectId', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

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
							expect.objectContaining({ source: expect.any(Types.ObjectId) }),
						],
					}),
				},
			},
		);
	});

	test('maps url source type to name/url object', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await addMeal({
			...validData,
			dishes: [
				{
					name: 'Pasta',
					sourceType: 'url',
					urlName: 'My Blog',
					urlValue: 'https://example.com',
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
								source: { name: 'My Blog', url: 'https://example.com' },
							}),
						],
					}),
				},
			},
		);
	});

	test('sets source to undefined when sourceType is none', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

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

	test('sets source to undefined when saved sourceType has no savedId', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

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

	test('sets source to undefined when url sourceType has no urlName', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await addMeal({
			...validData,
			dishes: [{ name: 'Pasta', sourceType: 'url' }],
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

	test('omits url from source when urlValue is empty', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		await addMeal({
			...validData,
			dishes: [
				{ name: 'Pasta', sourceType: 'url', urlName: 'My Blog', urlValue: '' },
			],
		});

		expect(Planner.collection.updateOne).toHaveBeenCalledWith(
			expect.anything(),
			{
				$push: {
					'calendar.$.meals': expect.objectContaining({
						dishes: [
							expect.objectContaining({
								source: { name: 'My Blog', url: undefined },
							}),
						],
					}),
				},
			},
		);
	});

	test('includes description when provided', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

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

	test('omits description when not provided', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner() as never);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

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

	test('falls back to empty calendar when updated planner is null', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'authorized' });
		vi.mocked(Planner.findById)
			.mockResolvedValueOnce(makePlanner() as never)
			.mockResolvedValueOnce(null);
		vi.mocked(Planner.collection.updateOne).mockResolvedValue({
			matchedCount: 1,
		} as never);

		const result = await addMeal(validData);

		expect(result.ok).toBe(true);
		if (result.ok) expect(result.data.calendar).toEqual([]);
	});
});
