import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ButtonHTMLAttributes } from 'react';

import { RecipeChip } from './RecipeChip';

import { usePlannerSavedItems } from '../../../../_hooks/usePlannerSavedItems';

vi.mock('@/_components', () => ({
	PillButton: vi.fn((props: ButtonHTMLAttributes<HTMLButtonElement>) => (
		<button type="button" {...props} />
	)),
}));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);

const onTogglePanel = vi.fn();
const onStartLinking = vi.fn();

describe('RecipeChip', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('reads "Link recipe" while nothing is linked, and starts linking rather than opening the panel', () => {
		render(
			<RecipeChip
				source={null}
				onTogglePanel={onTogglePanel}
				onStartLinking={onStartLinking}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Link recipe' }));

		expect(onStartLinking).toHaveBeenCalledTimes(1);
		expect(onTogglePanel).not.toHaveBeenCalled();
	});

	it("shows a saved recipe's name, in full on hover", () => {
		vi.mocked(usePlannerSavedItems).mockReturnValueOnce([
			{ _id: 'saved-1', name: 'Lemon Herb Chicken', kind: 'recipe', tags: [] },
		]);
		render(
			<RecipeChip
				source={{ kind: 'saved', savedId: 'saved-1' }}
				onTogglePanel={onTogglePanel}
				onStartLinking={onStartLinking}
			/>,
		);

		const chip = screen.getByRole('button', { name: 'Lemon Herb Chicken' });
		expect(chip.getAttribute('title')).toBe('Lemon Herb Chicken');
	});

	it('shows a reference without its protocol, and in full on hover', () => {
		render(
			<RecipeChip
				source={{ kind: 'reference', text: 'https://example.com/soup' }}
				onTogglePanel={onTogglePanel}
				onStartLinking={onStartLinking}
			/>,
		);

		const chip = screen.getByRole('button', { name: 'example.com/soup' });
		expect(chip.getAttribute('title')).toBe('https://example.com/soup');
	});

	it('opens or closes the panel once something is linked', () => {
		render(
			<RecipeChip
				source={{ kind: 'reference', text: 'p. 12' }}
				onTogglePanel={onTogglePanel}
				onStartLinking={onStartLinking}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'p. 12' }));

		expect(onTogglePanel).toHaveBeenCalledTimes(1);
		expect(onStartLinking).not.toHaveBeenCalled();
	});
});
