import { describe, expect, it, vi } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { findNamelessDishes } from './findNamelessDishes';
import { isBlankDish } from './isBlankDish';

vi.mock(
	'./isBlankDish',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/MealForm/_utils/isBlankDish'
		),
);

describe('findNamelessDishes', () => {
	it('finds the dishes with no name, counting spaces as none', () => {
		const empty = makeDishDraft({ key: 'a' });
		const spacesOnly = makeDishDraft({ key: 'b', name: '  ' });

		expect(
			findNamelessDishes([
				empty,
				makeDishDraft({ key: 'c', name: 'Soup' }),
				spacesOnly,
			]),
		).toEqual([empty, spacesOnly]);
	});

	it('leaves out blank dishes, which a save drops', () => {
		vi.mocked(isBlankDish).mockReturnValueOnce(true);

		expect(findNamelessDishes([makeDishDraft()])).toEqual([]);
	});
});
