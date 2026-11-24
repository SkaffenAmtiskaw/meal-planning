import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { DishPanel } from './DishPanel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../DishRecipeSection/DishRecipeSection', () => ({
	DishRecipeSection: vi.fn(() => null),
}));

describe('DishPanel', () => {
	it('passes on what is typed in the note', () => {
		const onNoteChange = vi.fn();
		render(
			<DishPanel
				dish={makeDishDraft()}
				noteRef={{ current: null }}
				onUnlink={vi.fn()}
				onReferenceChange={vi.fn()}
				onNoteChange={onNoteChange}
			/>,
		);

		fireEvent.change(screen.getByPlaceholderText(/Prep reminders/), {
			target: { value: 'Buy bread' },
		});

		expect(onNoteChange).toHaveBeenCalledWith('Buy bread');
	});
});
