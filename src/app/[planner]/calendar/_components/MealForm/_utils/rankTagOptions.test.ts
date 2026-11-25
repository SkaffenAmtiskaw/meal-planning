import { describe, expect, it } from 'vitest';

import { makeSavedItem } from '#fixtures/savedItem';
import type { TagInterface } from '@/_models/types';

import { rankTagOptions } from './rankTagOptions';

const tag = (name: string): TagInterface => ({
	_id: name.toLowerCase(),
	name,
	color: 'fern',
});

const quick = tag('Quick');
const vegetarian = tag('Vegetarian');
const family = tag('Family Favorite');
const spicy = tag('spicy');

describe('rankTagOptions', () => {
	it('lists the unselected tags the counted items carry, most carried first, with their counts', () => {
		const tacos = makeSavedItem({ name: 'Tacos', tags: [quick, vegetarian] });
		const risotto = makeSavedItem({ name: 'Risotto', tags: [vegetarian] });

		expect(
			rankTagOptions({
				countOver: [tacos, risotto],
				savedItems: [tacos, risotto],
				selectedIds: [],
			}),
		).toEqual([
			{ tag: vegetarian, selected: false, count: 2 },
			{ tag: quick, selected: false, count: 1 },
		]);
	});

	it('leaves out tags no counted item carries, even when other saved items carry them', () => {
		const tacos = makeSavedItem({ name: 'Tacos', tags: [quick] });
		const chicken = makeSavedItem({ name: 'Chicken', tags: [family] });

		expect(
			rankTagOptions({
				countOver: [tacos],
				savedItems: [tacos, chicken],
				selectedIds: [],
			}),
		).toEqual([{ tag: quick, selected: false, count: 1 }]);
	});

	it("breaks a tie by how many of the planner's saved items carry the tag", () => {
		const tacos = makeSavedItem({ name: 'Tacos', tags: [quick, vegetarian] });
		const risotto = makeSavedItem({ name: 'Risotto', tags: [vegetarian] });

		expect(
			rankTagOptions({
				countOver: [tacos],
				savedItems: [tacos, risotto],
				selectedIds: [],
			}).map((option) => option.tag),
		).toEqual([vegetarian, quick]);
	});

	it('breaks a remaining tie by name, ignoring case', () => {
		const tacos = makeSavedItem({
			name: 'Tacos',
			tags: [vegetarian, spicy, quick],
		});

		expect(
			rankTagOptions({
				countOver: [tacos],
				savedItems: [tacos],
				selectedIds: [],
			}).map((option) => option.tag),
		).toEqual([quick, spicy, vegetarian]);
	});

	it('puts the selected tags first, in pick order, even when no counted item carries them', () => {
		const tacos = makeSavedItem({ name: 'Tacos', tags: [quick, vegetarian] });
		const chicken = makeSavedItem({ name: 'Chicken', tags: [family] });

		expect(
			rankTagOptions({
				countOver: [],
				savedItems: [tacos, chicken],
				selectedIds: ['vegetarian', 'family favorite'],
			}),
		).toEqual([
			{ tag: vegetarian, selected: true },
			{ tag: family, selected: true },
		]);
	});

	it('drops a selected id that no saved item carries any more', () => {
		const tacos = makeSavedItem({ name: 'Tacos', tags: [quick] });

		expect(
			rankTagOptions({
				countOver: [tacos],
				savedItems: [tacos],
				selectedIds: ['gone', 'quick'],
			}),
		).toEqual([{ tag: quick, selected: true }]);
	});
});
