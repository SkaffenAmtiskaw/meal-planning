import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishRecipeSection } from './DishRecipeSection';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock(
	'../../../../_hooks/usePlannerSavedItems',
	async () =>
		await import('#mocks/@app/[planner]/calendar/_hooks/usePlannerSavedItems'),
);

const handlers = {
	onUnlink: vi.fn(),
	onReferenceChange: vi.fn(),
	onStartLinking: vi.fn(),
};

describe('DishRecipeSection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('starts linking from Change', () => {
		render(
			<DishRecipeSection
				source={{ kind: 'saved', savedId: 'saved-1' }}
				{...handlers}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Change' }));

		expect(handlers.onStartLinking).toHaveBeenCalledTimes(1);
	});

	it('starts linking from "Link a saved recipe"', () => {
		render(<DishRecipeSection source={null} {...handlers} />);

		fireEvent.click(
			screen.getByRole('button', { name: 'Link a saved recipe' }),
		);

		expect(handlers.onStartLinking).toHaveBeenCalledTimes(1);
	});

	it('unlinks a saved recipe from Remove', () => {
		render(
			<DishRecipeSection
				source={{ kind: 'saved', savedId: 'saved-1' }}
				{...handlers}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: 'Remove' }));

		expect(handlers.onUnlink).toHaveBeenCalledTimes(1);
		expect(screen.queryByPlaceholderText('URL, or book and page')).toBeNull();
	});

	it('shows the reference field, filled with the reference, and passes on what is typed', () => {
		render(
			<DishRecipeSection
				source={{ kind: 'reference', text: 'p. 12' }}
				{...handlers}
			/>,
		);
		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('p. 12');

		fireEvent.change(field, { target: { value: 'p. 14' } });

		expect(handlers.onReferenceChange).toHaveBeenCalledWith('p. 14');
	});

	it('leaves the reference field empty while nothing is linked', () => {
		render(<DishRecipeSection source={null} {...handlers} />);

		const field = screen.getByPlaceholderText(
			'URL, or book and page',
		) as HTMLInputElement;
		expect(field.value).toBe('');
	});
});
