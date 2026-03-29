import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/saved';

import { DeleteRecipeButton } from './DeleteRecipeButton';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock('@/_actions/saved', () => ({
	deleteRecipe: vi.fn(),
}));

vi.mock('@mantine/core', () => ({
	ActionIcon: ({
		children,
		disabled,
		onClick,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		onClick?: () => void;
		'data-testid'?: string;
	}) => (
		<button
			data-testid={testId}
			disabled={disabled}
			onClick={onClick}
			type="button"
		>
			{children}
		</button>
	),
}));

vi.mock('@tabler/icons-react', () => ({
	IconTrash: () => null,
}));

const plannerId = '507f1f77bcf86cd799439011';
const recipeId = '507f1f77bcf86cd799439012';

beforeEach(() => {
	vi.clearAllMocks();
});

describe('DeleteRecipeButton', () => {
	test('renders a delete button', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	test('button is enabled by default', () => {
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);
		expect(
			(screen.getByTestId('delete-button') as HTMLButtonElement).disabled,
		).toBe(false);
	});

	test('button is disabled when disabled prop is true', () => {
		render(
			<DeleteRecipeButton disabled plannerId={plannerId} recipeId={recipeId} />,
		);
		expect(
			(screen.getByTestId('delete-button') as HTMLButtonElement).disabled,
		).toBe(true);
	});

	test('clicking calls deleteRecipe and refreshes router', async () => {
		vi.mocked(deleteRecipe).mockResolvedValueOnce(undefined);
		render(<DeleteRecipeButton plannerId={plannerId} recipeId={recipeId} />);

		fireEvent.click(screen.getByTestId('delete-button'));

		await waitFor(() => {
			expect(deleteRecipe).toHaveBeenCalledWith({ plannerId, recipeId });
			expect(mockRefresh).toHaveBeenCalled();
		});
	});

	test('onClick is undefined when disabled', () => {
		render(
			<DeleteRecipeButton disabled plannerId={plannerId} recipeId={recipeId} />,
		);
		const button = screen.getByTestId('delete-button');
		fireEvent.click(button);
		expect(deleteRecipe).not.toHaveBeenCalled();
	});
});
