import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const renderList = (
	props: Partial<Parameters<typeof SavedResultList>[0]> = {},
) =>
	render(
		<SavedResultList
			results={[tacos, oats]}
			hasSavedItems
			linkedIds={new Set()}
			linking={false}
			highlightedIndex={null}
			onPick={vi.fn()}
			onHover={vi.fn()}
			itemRef={vi.fn()}
			{...props}
		/>,
	);

const rows = () => vi.mocked(SavedResultRow).mock.calls.map(([row]) => row);

describe('SavedResultList', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('points to the Recipes page when the planner has no saved recipes', () => {
		renderList({ results: [], hasSavedItems: false });

		expect(
			screen.getByText('No saved recipes yet. Add them on the Recipes page.'),
		).toBeTruthy();
	});

	it('says nothing matches when the search leaves no results', () => {
		renderList({ results: [] });

		expect(screen.getByText('No saved recipes match.')).toBeTruthy();
	});

	it('marks the recipes already on the meal as added, and passes on the one picked', () => {
		const onPick = vi.fn();
		renderList({ linkedIds: new Set(['tacos']), onPick });

		expect(rows().map((row) => row.added)).toEqual([true, false]);

		rows()[1].onPick();
		expect(onPick).toHaveBeenCalledWith(oats);
	});

	it('highlights only the result at the highlighted index, and reports which one the mouse is over', () => {
		const onHover = vi.fn();
		renderList({ highlightedIndex: 1, onHover });

		expect(rows().map((row) => row.highlighted)).toEqual([false, true]);

		rows()[0].onHover();
		expect(onHover).toHaveBeenCalledWith(0);
	});

	it("gives each row its index's ref", () => {
		const second = vi.fn();
		renderList({
			itemRef: (index: number) => (index === 1 ? second : vi.fn()),
		});

		expect(rows()[1].ref).toBe(second);
	});
});
