import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/saved';

import { DeleteRecipeButton } from './DeleteRecipeButton';

vi.mock('@/_actions/saved', () => ({
	deleteRecipe: vi.fn(),
}));

vi.mock('./DeleteItemButton', () => ({
	DeleteItemButton: ({
		onDelete,
		title,
		message,
		'data-testid': testId,
	}: {
		onDelete: () => Promise<unknown>;
		title: string;
		message: string;
		'data-testid'?: string;
	}) => (
		<div>
			<span data-testid="title">{title}</span>
			<span data-testid="message">{message}</span>
			<button
				data-testid={testId ?? 'delete-button'}
				onClick={onDelete}
				type="button"
			>
				Delete
			</button>
		</div>
	),
}));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

describe('DeleteRecipeButton', () => {
	test('renders with correct title and message', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(screen.getByTestId('title').textContent).toBe('Delete Recipe');
		expect(screen.getByTestId('message').textContent).toBe(
			'Are you sure you want to delete this recipe? This cannot be undone.',
		);
	});

	test('passes delete-button testid', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	test('onDelete calls deleteRecipe with correct args', async () => {
		vi.mocked(deleteRecipe).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		fireEvent.click(screen.getByTestId('delete-button'));
		expect(deleteRecipe).toHaveBeenCalledWith({ plannerId, recipeId });
	});
});
