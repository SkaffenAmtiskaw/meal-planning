import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { zMealFormSchema } from '@/_models/calendar';
import { newId } from '@/_models/database/newId';
import { planners } from '@/_models/database/planners';

import { addMeal } from './addMeal';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'@/_models/calendar',
	async () => await import('#mocks/@/_models/calendar'),
);
vi.mock(
	'@/_models/database/planners',
	async () => await import('#mocks/@/_models/database/planners'),
);
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';
const savedItemId = '507f1f77bcf86cd799439012';

const validData = {
	plannerId,
	date: '2024-06-15',
	mealName: 'Lunch',
	dishes: [{ name: 'Soup', sourceType: 'none' as const }],
};

const callAddMeal = (data: unknown) => {
	vi.mocked(zMealFormSchema.parse).mockReturnValue(data as never);
	return addMeal(data);
};

const noMatch = { matchedCount: 0 } as never;

const pushedMeal = () =>
	vi.mocked(planners.updateOne).mock.calls[0][1].$push?.[
		'calendar.$.meals'
	] as Record<string, unknown>;

const pushedDish = () =>
	(pushedMeal().dishes as Array<Record<string, unknown>>)[0];

describe('addMeal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(zMealFormSchema.parse).mockReturnValue(validData);
	});

	describe('validation', () => {
		it('propagates validation errors', async () => {
			vi.mocked(zMealFormSchema.parse).mockImplementation(() => {
				throw new Error('Invalid data');
			});

			await expect(addMeal({})).rejects.toThrow('Invalid data');
		});
	});

	describe('authorization', () => {
		it('returns Unauthorized when session is missing', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthenticated' });

			const result = await addMeal(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
			expect(planners.updateOne).not.toHaveBeenCalled();
		});

		it('returns Unauthorized when user does not own the planner', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

			const result = await addMeal(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
			expect(planners.updateOne).not.toHaveBeenCalled();
		});
	});

	describe('when authorized', () => {
		describe('adding meal to calendar', () => {
			it('pushes the meal onto the day when the date is already in the calendar', async () => {
				await addMeal(validData);

				expect(planners.updateOne).toHaveBeenCalledOnce();
				expect(planners.updateOne).toHaveBeenCalledWith(
					{ _id: plannerId, 'calendar.date': '2024-06-15' },
					{
						$push: {
							'calendar.$.meals': expect.objectContaining({ name: 'Lunch' }),
						},
					},
				);
			});

			it('pushes a new day holding the meal when the date is not in the calendar', async () => {
				vi.mocked(planners.updateOne).mockResolvedValueOnce(noMatch);

				await addMeal(validData);

				expect(planners.updateOne).toHaveBeenCalledTimes(2);
				expect(planners.updateOne).toHaveBeenLastCalledWith(
					{ _id: plannerId, 'calendar.date': { $ne: '2024-06-15' } },
					{
						$push: {
							calendar: {
								date: '2024-06-15',
								meals: [pushedMeal()],
							},
						},
					},
				);
			});

			it('returns Planner not found when neither update matches a planner', async () => {
				vi.mocked(planners.updateOne)
					.mockResolvedValueOnce(noMatch)
					.mockResolvedValueOnce(noMatch);

				const result = await addMeal(validData);

				expect(result).toEqual({ ok: false, error: 'Planner not found' });
				expect(planners.findOne).not.toHaveBeenCalled();
			});

			it('gives the meal and each dish a new id', async () => {
				vi.mocked(newId)
					.mockReturnValueOnce('toast-id')
					.mockReturnValueOnce('tea-id')
					.mockReturnValueOnce('meal-id');

				await callAddMeal({
					...validData,
					dishes: [
						{ name: 'Toast', sourceType: 'none' },
						{ name: 'Tea', sourceType: 'none' },
					],
				});

				expect(pushedMeal()).toMatchObject({
					_id: 'meal-id',
					dishes: [
						{ _id: 'toast-id', name: 'Toast' },
						{ _id: 'tea-id', name: 'Tea' },
					],
				});
			});
		});

		describe('dish source mapping', () => {
			it('maps saved source type to the saved item id', async () => {
				await callAddMeal({
					...validData,
					dishes: [
						{ name: 'Pasta', sourceType: 'saved', savedId: savedItemId },
					],
				});

				expect(pushedDish().source).toBe(savedItemId);
			});

			it('maps text source type to url object when a URL is provided', async () => {
				await callAddMeal({
					...validData,
					dishes: [
						{
							name: 'Pasta',
							sourceType: 'text',
							sourceText: 'https://example.com',
						},
					],
				});

				expect(pushedDish().source).toEqual({ url: 'https://example.com' });
			});

			it('maps text source type to ref object when a plain string is provided', async () => {
				await callAddMeal({
					...validData,
					dishes: [
						{
							name: 'Pasta',
							sourceType: 'text',
							sourceText: 'The Flavor Bible',
						},
					],
				});

				expect(pushedDish().source).toEqual({ ref: 'The Flavor Bible' });
			});

			it('leaves out source when sourceType is none', async () => {
				await addMeal(validData);

				expect(pushedDish()).not.toHaveProperty('source');
			});

			it('leaves out source when saved sourceType has no savedId', async () => {
				await callAddMeal({
					...validData,
					dishes: [{ name: 'Pasta', sourceType: 'saved' }],
				});

				expect(pushedDish()).not.toHaveProperty('source');
			});

			it('leaves out source when text sourceType has empty sourceText', async () => {
				await callAddMeal({
					...validData,
					dishes: [{ name: 'Pasta', sourceType: 'text', sourceText: '' }],
				});

				expect(pushedDish()).not.toHaveProperty('source');
			});
		});

		describe('optional fields', () => {
			it('includes description when provided', async () => {
				await callAddMeal({ ...validData, description: 'A hearty lunch' });

				expect(pushedMeal().description).toBe('A hearty lunch');
			});

			it('leaves out description when it is empty', async () => {
				await callAddMeal({ ...validData, description: '' });

				expect(pushedMeal()).not.toHaveProperty('description');
			});

			it('includes dish note when provided', async () => {
				await callAddMeal({
					...validData,
					dishes: [{ name: 'Pasta', sourceType: 'none', note: 'Extra cheese' }],
				});

				expect(pushedDish().note).toBe('Extra cheese');
			});

			it('leaves out dish note when it is empty', async () => {
				await callAddMeal({
					...validData,
					dishes: [{ name: 'Pasta', sourceType: 'none', note: '' }],
				});

				expect(pushedDish()).not.toHaveProperty('note');
			});
		});

		describe('result', () => {
			it('returns the planner calendar read after the update', async () => {
				const calendar = [
					{ date: '2024-06-15', meals: [{ name: 'Lunch', dishes: [] }] },
				];
				vi.mocked(planners.findOne).mockResolvedValueOnce({
					_id: plannerId,
					calendar,
				} as never);

				const result = await addMeal(validData);

				expect(planners.findOne).toHaveBeenCalledWith({ _id: plannerId });
				expect(result).toEqual({ ok: true, data: { calendar } });
			});

			it('returns an empty calendar when the planner is gone by the read', async () => {
				vi.mocked(planners.findOne).mockResolvedValueOnce(null);

				const result = await addMeal(validData);

				expect(result).toEqual({ ok: true, data: { calendar: [] } });
			});
		});
	});
});
