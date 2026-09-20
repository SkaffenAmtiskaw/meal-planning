import { render } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/library';

import { DeleteItemButton } from './DeleteItemButton';
import { DeleteRecipeButton } from './DeleteRecipeButton';

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

vi.mock('./DeleteItemButton', () => ({
	DeleteItemButton: vi.fn(() => null),
}));

describe('DeleteRecipeButton', () => {
	const plannerId = '507f1f77bcf86cd799439011';
	const recipeId = '507f1f77bcf86cd799439012';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls deleteRecipe with correct args when onDelete is invoked', async () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);

		const onDelete = vi.mocked(DeleteItemButton).mock.calls[0][0].onDelete;
		await onDelete();

		expect(deleteRecipe).toHaveBeenCalledWith({ plannerId, recipeId });
	});
});
