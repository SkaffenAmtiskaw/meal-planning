import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SavedItem } from '@/_actions/library/types';

import { PhoneSavedResultRow } from './PhoneSavedResultRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../SavedItemSummary/SavedItemSummary', () => ({
	SavedItemSummary: vi.fn(() => null),
}));
vi.mock('../SourceMark/SourceMark', () => ({
	SourceMark: vi.fn(() => null),
}));

const pasta: SavedItem = {
	_id: 'pasta',
	name: 'Weeknight Pasta Ideas',
	kind: 'bookmark',
	tags: [],
	url: 'https://example.com',
};

describe('PhoneSavedResultRow', () => {
	it('uses the recipe for the dish', () => {
		const onUse = vi.fn();
		render(<PhoneSavedResultRow item={pasta} added={false} onUse={onUse} />);

		fireEvent.click(
			screen.getByRole('button', { name: 'Use Weeknight Pasta Ideas' }),
		);

		expect(onUse).toHaveBeenCalledTimes(1);
	});

	it('shows a recipe already on the meal as added, with nothing to tap', () => {
		render(<PhoneSavedResultRow item={pasta} added onUse={vi.fn()} />);

		expect(screen.queryByText('Added')).not.toBeNull();
		expect(screen.queryByRole('button')).toBeNull();
	});
});
