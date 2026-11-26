import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';

import { orderByRecentUse } from './orderByRecentUse';

const names = (items: { name: string }[]) => items.map((item) => item.name);

describe('orderByRecentUse', () => {
	it('lists used items first, most recently used at the top', () => {
		const ordered = orderByRecentUse([
			makeSavedItem({ name: 'Apple Crumble' }),
			makeSavedItem({
				name: 'Overnight Oats',
				lastUsed: '2026-11-20T09:00:00.000Z',
			}),
			makeSavedItem({
				name: 'Mushroom Risotto',
				lastUsed: '2026-11-24T18:30:00.000Z',
			}),
		]);

		expect(names(ordered)).toEqual([
			'Mushroom Risotto',
			'Overnight Oats',
			'Apple Crumble',
		]);
	});

	it('orders items used at the same time by name, ignoring case', () => {
		const usedAt = '2026-11-23T12:00:00.000Z';

		const ordered = orderByRecentUse([
			makeSavedItem({ name: 'Lemon Herb Chicken', lastUsed: usedAt }),
			makeSavedItem({ name: 'black Bean Tacos', lastUsed: usedAt }),
		]);

		expect(names(ordered)).toEqual(['black Bean Tacos', 'Lemon Herb Chicken']);
	});

	it('orders the items never used by name, ignoring case', () => {
		const ordered = orderByRecentUse([
			makeSavedItem({ name: 'Zucchini Fritters' }),
			makeSavedItem({ name: 'apple Crumble' }),
			makeSavedItem({ name: 'Sheet Pan Dinners' }),
		]);

		expect(names(ordered)).toEqual([
			'apple Crumble',
			'Sheet Pan Dinners',
			'Zucchini Fritters',
		]);
	});
});
