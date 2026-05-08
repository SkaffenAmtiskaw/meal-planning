import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth';
import { zMealFormSchema } from '@/_models/calendar';
import { Planner } from '@/_models/planner';

import { addMeal } from './addMeal';

vi.mock('@/_actions/auth', async () => await import('@mocks/@/_actions/auth'));
vi.mock(
	'@/_models/calendar',
	async () => await import('@mocks/@/_models/calendar'),
);
vi.mock(
	'@/_models/planner',
	async () => await import('@mocks/@/_models/planner'),
);

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

const callAddMeal = (data: any) => {
	vi.mocked(zMealFormSchema.parse as any).mockReturnValue(data);
	return addMeal(data);
};

describe('addMeal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(zMealFormSchema.parse as any).mockReturnValue(validData);
		vi.mocked(Planner.findById).mockResolvedValue(makePlanner());
		vi.mocked(Planner.collection.updateOne as any).mockResolvedValue({
			matchedCount: 1,
		});
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
			expect(Planner.findById).not.toHaveBeenCalled();
		});

		it('returns Unauthorized when user does not own the planner', async () => {
			vi.mocked(checkAuth).mockResolvedValueOnce({ type: 'unauthorized' });

			const result = await addMeal(validData);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		});
	});

	describe('when authorized', () => {
		describe('planner lookup', () => {
			it('returns Planner not found when planner does not exist', async () => {
				vi.mocked(Planner.findById).mockResolvedValueOnce(null);

				const result = await addMeal(validData);

				expect(result).toEqual({ ok: false, error: 'Planner not found' });
			});
		});

		describe('adding meal to calendar', () => {
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
				expect(result).toEqual({
					ok: true,
					data: { calendar: expect.any(Array) },
				});
			});

			it('adds new day when date is not in calendar', async () => {
				vi.mocked(Planner.collection.updateOne as any).mockResolvedValueOnce({
					matchedCount: 0,
				});

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
		});

		describe('dish source mapping', () => {
			it('maps saved source type to ObjectId', async () => {
				await callAddMeal({
					...validData,
					dishes: [
						{ name: 'Pasta', sourceType: 'saved', savedId: savedItemId },
					],
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
				await callAddMeal({
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
				await callAddMeal({
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
		});

		describe('optional fields', () => {
			it('includes description when provided', async () => {
				await callAddMeal({ ...validData, description: 'A hearty lunch' });

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
				await callAddMeal({
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
		});

		describe('result', () => {
			it('returns the updated calendar on success', async () => {
				const calendar = [
					{ date: '2024-06-15', meals: [{ name: 'Lunch', dishes: [] }] },
				];
				vi.mocked(Planner.findById)
					.mockResolvedValueOnce(makePlanner())
					.mockResolvedValueOnce({ calendar });

				const result = await addMeal(validData);

				expect(result).toEqual({ ok: true, data: { calendar } });
			});

			it('falls back to empty calendar when updated planner is null', async () => {
				vi.mocked(Planner.findById)
					.mockResolvedValueOnce(makePlanner())
					.mockResolvedValueOnce(null);

				const result = await addMeal(validData);

				expect(result).toEqual({ ok: true, data: { calendar: [] } });
			});
		});
	});
});
