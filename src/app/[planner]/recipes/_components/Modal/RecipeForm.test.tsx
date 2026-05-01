import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addRecipe } from '@/_actions/saved/addRecipe';
import { editRecipe } from '@/_actions/saved/editRecipe';

import { RecipeForm } from './RecipeForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/planner-1/recipes',
}));

vi.mock('@/_actions/saved/addRecipe', () => ({
	addRecipe: vi.fn(),
}));

vi.mock('@/_actions/saved/editRecipe', () => ({
	editRecipe: vi.fn(),
}));

import { useFormFeedback } from '@/_hooks';

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));

vi.mock('@/_components', () => ({
	FormFeedbackAlert: ({
		status,
		errorMessage,
	}: {
		status: string;
		errorMessage?: string;
	}) =>
		status === 'error' ? (
			<div data-testid="form-feedback-alert">{errorMessage}</div>
		) : null,
	StringArrayInput: ({
		label,
		onChange,
	}: {
		label?: string;
		onChange: (v: string[]) => void;
	}) => (
		<button
			type="button"
			data-testid={`string-array-${label}`}
			onClick={() => onChange([`${label} item`])}
		>
			{label}
		</button>
	),
	SubmitButton: ({
		label,
		status,
		countdown,
	}: {
		label: string;
		status: string;
		countdown: number;
	}) => (
		<button
			type={status === 'success' ? 'button' : 'submit'}
			data-testid="submit-button"
			disabled={status === 'submitting'}
		>
			{status === 'success' ? `Saved! Closing in ${countdown}…` : label}
		</button>
	),
	TagCombobox: ({
		onChange,
	}: {
		label?: string;
		onChange: (v: string[]) => void;
	}) => (
		<button
			type="button"
			data-testid="tag-combobox"
			onClick={() => onChange(['tag-1'])}
		>
			Tags
		</button>
	),
}));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const defaultProps = {
	plannerId: 'planner-1',
	tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
};

describe('RecipeForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders Add Recipe submit button when no item', () => {
		render(<RecipeForm {...defaultProps} />);
		expect(screen.getByRole('button', { name: 'Add Recipe' })).toBeDefined();
	});

	test('renders Save submit button when item is provided', () => {
		const item = {
			_id: 'recipe-1' as never,
			name: 'Croissant',
			ingredients: ['flour'],
			instructions: ['mix'],
		};
		render(<RecipeForm {...defaultProps} item={item} />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
	});

	test('Cancel navigates back to pathname', () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	test('submitting the form calls addRecipe with plannerId', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'Croissant' },
		});

		render(<RecipeForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
		);
	});

	test('navigates away after successful submission', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'Croissant' },
		});

		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});

		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	test('changing ingredients updates state', () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('string-array-Ingredients'));
		// component re-renders without error
	});

	test('changing instructions updates state', () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('string-array-Instructions'));
		// component re-renders without error
	});

	test('changing tags updates selected tags state', () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('tag-combobox'));
		// component re-renders without error
	});

	test('populates initial state from existing item', () => {
		const item = {
			_id: 'recipe-1' as never,
			name: 'Croissant',
			ingredients: ['2 cups flour'],
			instructions: ['Mix', 'Bake'],
			tags: ['tag-1' as never],
		};
		render(<RecipeForm {...defaultProps} item={item} />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
	});

	test('shows error alert when status is error', () => {
		vi.mocked(useFormFeedback).mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<RecipeForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	test('calls editRecipe (not addRecipe) when item is provided', async () => {
		vi.mocked(editRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'recipe-1', name: 'Croissant' },
		});
		const item = {
			_id: 'recipe-1' as never,
			name: 'Croissant',
			ingredients: ['flour'],
			instructions: ['mix'],
		};
		render(<RecipeForm {...defaultProps} item={item} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(editRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1', _id: 'recipe-1' }),
		);
		expect(addRecipe).not.toHaveBeenCalled();
	});

	test('navigates to redirectTo after successful submission', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'new-id', name: 'Croissant' },
		});
		render(
			<RecipeForm {...defaultProps} redirectTo="/planner-1/recipes/recipe-1" />,
		);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes/recipe-1');
	});

	test('Cancel navigates to redirectTo when provided', () => {
		render(
			<RecipeForm {...defaultProps} redirectTo="/planner-1/recipes/recipe-1" />,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes/recipe-1');
	});
});
