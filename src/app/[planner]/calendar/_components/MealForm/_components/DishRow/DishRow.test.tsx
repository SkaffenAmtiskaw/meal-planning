import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { makeDishDraft } from '#fixtures/dish';

import { DishRow } from './DishRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));
vi.mock('../DishNameInput/DishNameInput', () => ({
	DishNameInput: vi.fn(() => null),
}));
vi.mock('../DeleteDishButton/DeleteDishButton', () => ({
	DeleteDishButton: vi.fn(() => <button type="button">Delete dish</button>),
}));

const props = {
	dish: makeDishDraft({ name: 'Soup' }),
	onRename: vi.fn(),
	onDelete: vi.fn(),
};

describe('DishRow', () => {
	it('shows the delete button when the dish can be deleted', () => {
		render(<DishRow {...props} canDelete />);

		expect(screen.getByRole('button', { name: 'Delete dish' })).toBeDefined();
	});

	it("hides the delete button when it's the meal's last dish", () => {
		render(<DishRow {...props} canDelete={false} />);

		expect(screen.queryByRole('button', { name: 'Delete dish' })).toBeNull();
	});
});
