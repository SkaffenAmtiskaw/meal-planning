import { describe, expect, it } from 'vitest';

import { searchKeyIntent } from './searchKeyIntent';

const press = (
	key: string,
	{
		hasText = false,
		linking = false,
		isComposing = false,
	}: { hasText?: boolean; linking?: boolean; isComposing?: boolean } = {},
) => searchKeyIntent({ key, isComposing }, { hasText, linking });

describe('searchKeyIntent', () => {
	it.each([
		['ArrowDown', 'moveDown'],
		['ArrowUp', 'moveUp'],
		['Enter', 'run'],
	])('turns %s into %s', (key, intent) => {
		expect(press(key)).toBe(intent);
	});

	it('clears a search with text outside link mode', () => {
		expect(press('Escape', { hasText: true })).toBe('clear');
	});

	it('leaves Esc to the modal when the search is empty', () => {
		expect(press('Escape')).toBe('pass');
	});

	it.each([
		false,
		true,
	])('leaves Esc to link mode while linking (search has text: %s)', (hasText) => {
		expect(press('Escape', { hasText, linking: true })).toBe('pass');
	});

	it('ignores any other key', () => {
		expect(press('a')).toBe('ignore');
	});

	it.each([
		'Enter',
		'Escape',
		'ArrowDown',
	])('ignores %s while an input method is composing', (key) => {
		expect(press(key, { hasText: true, isComposing: true })).toBe('ignore');
	});
});
