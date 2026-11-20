import { beforeEach, describe, expect, it, vi } from 'vitest';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';

import { plannerCache } from './caches';
import { defineMutation } from './defineMutation';
import { invalidate } from './invalidate';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);
vi.mock(
	'./invalidate',
	async () => await import('#mocks/@/_actions/_utils/invalidate'),
);

const plannerId = '507f1f77bcf86cd799439011';

const schema = z.object({
	plannerId: z.string(),
	name: z.string().min(1, { error: 'Name is required' }),
	note: z.string().min(1, { error: 'Note is required' }),
});

const handler = vi.fn();

const mutation = defineMutation({
	schema,
	access: { planner: (input) => input.plannerId, level: 'write' },
	invalidates: (input) => [plannerCache.calendar(input.plannerId)],
	handler,
});

const validInput = { plannerId, name: 'Lunch', note: 'Early' };

describe('defineMutation', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		handler.mockResolvedValue({ ok: true, data: 'done' });
	});

	describe('invalid input', () => {
		it("returns the schema's first issue message", async () => {
			const result = await mutation({ plannerId, name: '', note: '' });

			expect(result).toEqual({ ok: false, error: 'Name is required' });
		});

		it('runs neither the access check nor the handler', async () => {
			await mutation({ plannerId, name: '', note: '' });

			expect(checkAuth).not.toHaveBeenCalled();
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe('access', () => {
		it("checks the input's planner at the mutation's level", async () => {
			await mutation(validInput);

			expect(checkAuth).toHaveBeenCalledWith(plannerId, 'write');
		});

		it.each([
			{ type: 'unauthenticated' as const },
			{ type: 'unauthorized' as const },
			{ type: 'error' as const, error: new Error('Database down') },
		])('returns Unauthorized without running the handler when access is $type', async (auth) => {
			vi.mocked(checkAuth).mockResolvedValueOnce(auth);

			const result = await mutation(validInput);

			expect(result).toEqual({ ok: false, error: 'Unauthorized' });
			expect(handler).not.toHaveBeenCalled();
			expect(invalidate).not.toHaveBeenCalled();
		});
	});

	describe('when authorized', () => {
		it('runs the handler with the parsed input', async () => {
			await mutation({ ...validInput, extra: 'dropped' });

			expect(handler).toHaveBeenCalledWith(validInput);
		});

		it("invalidates the mutation's tags and returns the handler's result when it succeeds", async () => {
			const result = await mutation(validInput);

			expect(invalidate).toHaveBeenCalledWith([
				plannerCache.calendar(plannerId),
			]);
			expect(result).toEqual({ ok: true, data: 'done' });
		});

		it("returns the handler's failure without invalidating", async () => {
			handler.mockResolvedValueOnce({ ok: false, error: 'Planner not found' });

			const result = await mutation(validInput);

			expect(result).toEqual({ ok: false, error: 'Planner not found' });
			expect(invalidate).not.toHaveBeenCalled();
		});

		it('lets what the handler throws pass through, without invalidating', async () => {
			handler.mockRejectedValueOnce(new Error('Write check failed'));

			await expect(mutation(validInput)).rejects.toThrow('Write check failed');
			expect(invalidate).not.toHaveBeenCalled();
		});
	});
});
