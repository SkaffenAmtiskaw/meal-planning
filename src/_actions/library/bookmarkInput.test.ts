import { describe, expect, test } from 'vitest';

import { newId } from '@/_models/database/newId';

import { zBookmarkInput } from './bookmarkInput';

const validInput = {
	name: "Ursula's Sea Spell Collection",
	url: 'https://undersea.example.com/spells',
	tags: [newId()],
	plannerId: newId(),
};

describe('zBookmarkInput', () => {
	test('accepts a valid form payload', () => {
		expect(zBookmarkInput.safeParse(validInput).success).toBe(true);
	});

	test('accepts an empty tags array', () => {
		expect(zBookmarkInput.safeParse({ ...validInput, tags: [] }).success).toBe(
			true,
		);
	});

	test('rejects an empty name', () => {
		expect(zBookmarkInput.safeParse({ ...validInput, name: '' }).success).toBe(
			false,
		);
	});

	test('rejects an invalid URL', () => {
		expect(
			zBookmarkInput.safeParse({ ...validInput, url: 'not-a-url' }).success,
		).toBe(false);
	});

	test('rejects a missing plannerId', () => {
		const { plannerId: _, ...rest } = validInput;
		expect(zBookmarkInput.safeParse(rest).success).toBe(false);
	});

	test('accepts an optional notes field', () => {
		expect(
			zBookmarkInput.safeParse({ ...validInput, notes: 'Some notes' }).success,
		).toBe(true);
	});

	test('accepts notes set to an empty string, which the form starts at', () => {
		expect(zBookmarkInput.safeParse({ ...validInput, notes: '' }).success).toBe(
			true,
		);
	});

	test('drops fields the form does not edit, such as lastUsedAt', () => {
		const parsed = zBookmarkInput.parse({
			...validInput,
			_id: newId(),
			lastUsedAt: new Date(),
		});

		expect(parsed).not.toHaveProperty('_id');
		expect(parsed).not.toHaveProperty('lastUsedAt');
	});
});
