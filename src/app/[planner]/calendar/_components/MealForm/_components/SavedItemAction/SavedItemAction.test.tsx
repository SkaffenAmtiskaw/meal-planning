import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SavedItemAction } from './SavedItemAction';

import { savedItemAction } from '../../_utils/savedItemAction';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../../_utils/savedItemAction', () => ({
	savedItemAction: vi.fn(() => 'add'),
}));

const renderAction = (onPick = vi.fn()) =>
	render(
		<SavedItemAction
			itemName="Tacos"
			added={false}
			linking={false}
			onPick={onPick}
		/>,
	);

describe('SavedItemAction', () => {
	it('adds the recipe', () => {
		const onPick = vi.fn();
		renderAction(onPick);

		fireEvent.click(screen.getByRole('button', { name: 'Add Tacos' }));

		expect(onPick).toHaveBeenCalled();
	});

	it('links the recipe while a dish is being linked', () => {
		vi.mocked(savedItemAction).mockReturnValueOnce('link');
		const onPick = vi.fn();
		renderAction(onPick);

		fireEvent.click(screen.getByRole('button', { name: 'Link Tacos' }));

		expect(onPick).toHaveBeenCalled();
	});

	it('does nothing once the recipe is on the meal', () => {
		vi.mocked(savedItemAction).mockReturnValueOnce('added');
		const onPick = vi.fn();
		renderAction(onPick);

		fireEvent.click(screen.getByRole('button', { name: 'Tacos, added' }));

		expect(onPick).not.toHaveBeenCalled();
	});
});
