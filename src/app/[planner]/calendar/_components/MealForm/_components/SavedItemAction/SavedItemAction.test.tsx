import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedItemAction } from './SavedItemAction';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SavedItemAction', () => {
	it('adds the recipe', () => {
		const onPick = vi.fn();
		render(
			<SavedItemAction
				itemName="Tacos"
				added={false}
				linking={false}
				onPick={onPick}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Add Tacos' }));

		expect(onPick).toHaveBeenCalled();
	});

	it('links the recipe while a dish is being linked', () => {
		const onPick = vi.fn();
		render(
			<SavedItemAction
				itemName="Tacos"
				added={false}
				linking
				onPick={onPick}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Link Tacos' }));

		expect(onPick).toHaveBeenCalled();
	});

	it.each([
		false,
		true,
	])('does nothing once the recipe is on the meal (linking: %s)', (linking) => {
		const onPick = vi.fn();
		render(
			<SavedItemAction
				itemName="Tacos"
				added
				linking={linking}
				onPick={onPick}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Tacos, added' }));

		expect(onPick).not.toHaveBeenCalled();
	});
});
