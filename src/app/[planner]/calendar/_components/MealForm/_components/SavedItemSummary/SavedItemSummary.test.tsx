import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { SavedItemSummary } from './SavedItemSummary';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'@/app/[planner]/_components/Tag/Tag',
	async () => await import('#mocks/@/app/[planner]/_components/Tag/Tag'),
);

const recipe: SavedItem = {
	_id: 'saved-1',
	name: 'Black Bean Tacos',
	kind: 'recipe',
	tags: [],
};

describe('SavedItemSummary', () => {
	it.each([
		{ item: recipe, label: 'Recipe' },
		{
			item: { ...recipe, kind: 'bookmark', url: 'https://example.com' },
			label: 'Bookmark',
		},
	] as const)('names the kind of a $item.kind', ({ item, label }) => {
		render(<SavedItemSummary item={item} />);

		expect(screen.getByText(label)).toBeTruthy();
	});

	it('shows a badge for each tag, and none for an item with no tags', () => {
		const { rerender } = render(<SavedItemSummary item={recipe} />);
		expect(screen.queryByTestId('badge')).toBeNull();

		rerender(
			<SavedItemSummary
				item={{
					...recipe,
					tags: [{ _id: 'tag-1', name: 'Quick', color: 'fern' }],
				}}
			/>,
		);

		expect(screen.getByTestId('badge').textContent).toBe('Quick');
	});
});
