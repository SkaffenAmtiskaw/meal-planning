import { afterEach, describe, expect, test, vi } from 'vitest';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { Planner } from '@/_models/planner';

import { addBookmark } from './addBookmark';

vi.mock(
	'@/_actions/auth/checkAuth',
	async () => await import('#mocks/@/_actions/auth/checkAuth'),
);

vi.mock('@/_models/planner', () => ({
	Planner: {
		findById: vi.fn(),
	},
}));
vi.mock(
	'@/_models/database/newId',
	async () => await import('#mocks/@/_models/database/newId'),
);

const plannerId = '507f1f77bcf86cd799439011';

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

	const makePlanner = () => ({
		saved: [] as Array<Record<string, unknown>>,
		save: vi.fn().mockResolvedValue(undefined),
	});

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
		vi.mocked(Planner.findById).mockResolvedValue(null);

		const result = await addBookmark(validData);

		expect(result).toEqual({ ok: false, error: 'Planner not found' });
	});

	test('persists the bookmark with a new id and returns that id and its name', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addBookmark(validData);

		expect(planner.save).toHaveBeenCalledOnce();
		expect(planner.saved[0]._id).toBe('new-id');
		expect(result).toEqual({
			ok: true,
			data: { _id: 'new-id', name: "Ursula's Sea Spell Collection" },
		});
	});

	test('leaves out notes when they are empty', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		await addBookmark({ ...validData, notes: '' });

		expect(planner.saved[0]).not.toHaveProperty('notes');
	});

	test('keeps notes when they are filled in', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		await addBookmark({ ...validData, notes: 'Read later' });

		expect(planner.saved[0]).toHaveProperty('notes', 'Read later');
	});

	test('accepts optional tags', async () => {
		const planner = makePlanner();
		vi.mocked(Planner.findById).mockResolvedValue(planner as never);

		const result = await addBookmark({
			...validData,
			tags: ['507f1f77bcf86cd799439013'],
		});

		expect(result.ok).toBe(true);
		if (result.ok)
			expect(result.data.name).toBe("Ursula's Sea Spell Collection");
	});
});
