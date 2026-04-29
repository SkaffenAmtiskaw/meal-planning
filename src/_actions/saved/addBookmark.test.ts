import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models';

import { addBookmark } from './addBookmark';

vi.mock('@/_actions/auth/checkAuth', () => ({
	checkAuth: vi.fn(),
}));

vi.mock('@/_models', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));

const plannerId = new Types.ObjectId().toString();

const validData = {
	plannerId,
	name: "Ursula's Sea Spell Collection",
	url: 'https://undersea.example.com/spells',
	tags: [],
};

describe('addBookmark', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	const makePlanner = () => {
		const saved: Array<Record<string, unknown>> = [];
		const originalPush = Array.prototype.push.bind(saved);
		saved.push = (...items: Record<string, unknown>[]) =>
			originalPush(
				...items.map((item) => ({ _id: new Types.ObjectId(), ...item })),
			);
		return { saved, save: vi.fn().mockResolvedValue(undefined) };
	};

	test('throws ZodError on invalid input', async () => {
		await expect(addBookmark({})).rejects.toThrow();
	});

	test('throws ZodError when name is empty string', async () => {
		await expect(addBookmark({ ...validData, name: '' })).rejects.toThrow();
	});

	test('throws ZodError when url is invalid', async () => {
		await expect(
			addBookmark({ ...validData, url: 'not-a-url' }),
		).rejects.toThrow();
	});

	test('returns Unauthorized error when session is missing', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthenticated' });

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
		expect(Planner.findById).not.toHaveBeenCalled();
	});

	test('returns Unauthorized error when user does not own the planner', async () => {
		vi.mocked(checkAuth).mockResolvedValue({ type: 'unauthorized' });

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Unauthorized' });
	});

	test('returns Planner not found error when planner does not exist', async () => {
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('persists the bookmark and returns _id and name', async () => {
		const planner = makePlanner();
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addBookmark(validData);

		expect(planner.save).toHaveBeenCalledOnce();
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.data.name).toBe("Ursula's Sea Spell Collection");
			expect(result.data._id).toMatch(/^[0-9a-f]{24}$/);
		}
	});

	test('accepts optional tags', async () => {
		const planner = makePlanner();
		vi.mocked(checkAuth).mockResolvedValue({
			type: 'authorized',
			accessLevel: 'write',
			user: {
				_id: 'user-id',
				email: 'test@example.com',
				name: 'Test User',
				planners: [],
			},
		} as never);
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addBookmark({
			...validData,
			tags: [new Types.ObjectId().toString()],
		});

		expect(result.ok).toBe(true);
		if (result.ok)
			expect(result.data.name).toBe("Ursula's Sea Spell Collection");
	});
});
