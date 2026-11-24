import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { SavedResultList } from './SavedResultList';

import { SavedResultRow } from '../SavedResultRow/SavedResultRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../SavedResultRow/SavedResultRow', () => ({
	SavedResultRow: vi.fn(() => null),
}));

const tacos: SavedItem = {
	_id: 'tacos',
	name: 'Black Bean Tacos',
	kind: 'recipe',
	tags: [],
};
const oats: SavedItem = {
	_id: 'oats',
	name: 'Overnight Oats',
	kind: 'recipe',
	tags: [],
};

describe('SavedResultList', () => {
	it('points to the Recipes page when the planner has no saved recipes', () => {
		render(
			<SavedResultList
				results={[]}
				hasSavedItems={false}
				linkedIds={new Set()}
				linking={false}
				onPick={vi.fn()}
			/>,
		);

		expect(
			screen.getByText('No saved recipes yet. Add them on the Recipes page.'),
		).toBeTruthy();
	});

	it('says nothing matches when the search leaves no results', () => {
		render(
			<SavedResultList
				results={[]}
				hasSavedItems
				linkedIds={new Set()}
				linking={false}
				onPick={vi.fn()}
			/>,
		);

		expect(screen.getByText('No saved recipes match.')).toBeTruthy();
	});

	it('marks the recipes already on the meal as added, and passes on the one picked', () => {
		const onPick = vi.fn();
		render(
			<SavedResultList
				results={[tacos, oats]}
				hasSavedItems
				linkedIds={new Set(['tacos'])}
				linking={false}
				onPick={onPick}
			/>,
		);

		const rows = vi.mocked(SavedResultRow).mock.calls.map(([props]) => props);
		expect(rows.map((row) => row.added)).toEqual([true, false]);

		rows[1].onPick();
		expect(onPick).toHaveBeenCalledWith(oats);
	});
});
