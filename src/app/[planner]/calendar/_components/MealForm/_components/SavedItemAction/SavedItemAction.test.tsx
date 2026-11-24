import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedItemAction } from './SavedItemAction';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SavedItemAction', () => {
	it('adds the recipe', () => {
		const onAdd = vi.fn();
		render(<SavedItemAction itemName="Tacos" added={false} onAdd={onAdd} />);

		fireEvent.click(screen.getByRole('button', { name: 'Add Tacos' }));

		expect(onAdd).toHaveBeenCalled();
	});

	it('does nothing once the recipe is on the meal', () => {
		const onAdd = vi.fn();
		render(<SavedItemAction itemName="Tacos" added onAdd={onAdd} />);

		fireEvent.click(screen.getByRole('button', { name: 'Tacos, added' }));

		expect(onAdd).not.toHaveBeenCalled();
	});
});
