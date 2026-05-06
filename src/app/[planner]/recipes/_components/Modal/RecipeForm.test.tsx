import { usePathname, useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { addRecipe, editRecipe } from '@/_actions/library';
import { useFormFeedback } from '@/_hooks';

import { RecipeForm } from './RecipeForm';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

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
	StringArrayInput: vi.fn(({ label }: { label?: string }) => (
		<div data-testid={`string-array-${label}`}>{label}</div>
	)),
	SubmitButton: ({ label }: { label: string }) => (
		<button type="submit">{label}</button>
	),
	TagCombobox: vi.fn(() => <div data-testid="tag-combobox">Tags</div>),
}));

vi.mock('@mantine/form', async () => await import('@mocks/@mantine/form'));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockPush = vi.fn();

const defaultProps = {
	plannerId: 'planner-1',
	tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
};

describe('RecipeForm', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
		vi.mocked(usePathname).mockReturnValue('/planner-1/recipes');
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders Add Recipe submit button when no item', () => {
		render(<RecipeForm {...defaultProps} />);
		expect(screen.getByRole('button', { name: 'Add Recipe' })).toBeDefined();
	});

	it('renders Save submit button when item is provided', () => {
		const item = {
			_id: 'recipe-1' as never,
			name: 'Croissant',
			ingredients: ['flour'],
			instructions: ['mix'],
		};
		render(<RecipeForm {...defaultProps} item={item} />);
		expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
	});

	it('Cancel navigates back to pathname', () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	it('submitting the form calls addRecipe with plannerId', async () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		await vi.waitFor(() => {
			expect(addRecipe).toHaveBeenCalledWith(
				expect.objectContaining({ plannerId: 'planner-1' }),
			);
		});
	});

	it('navigates away after successful submission', async () => {
		render(<RecipeForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		await vi.waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
		});
	});

	it('shows error alert when status is error', () => {
		vi.mocked(useFormFeedback).mockReturnValueOnce({
			status: 'error',
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		} as ReturnType<typeof useFormFeedback>);
		render(<RecipeForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	it('calls editRecipe (not addRecipe) when item is provided', async () => {
		const item = {
			_id: 'recipe-1' as never,
			name: 'Croissant',
			ingredients: ['flour'],
			instructions: ['mix'],
		};
		render(<RecipeForm {...defaultProps} item={item} />);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		await vi.waitFor(() => {
			expect(editRecipe).toHaveBeenCalledWith(
				expect.objectContaining({ plannerId: 'planner-1', _id: 'recipe-1' }),
			);
			expect(addRecipe).not.toHaveBeenCalled();
		});
	});

	it('navigates to redirectTo after successful submission', async () => {
		render(
			<RecipeForm {...defaultProps} redirectTo="/planner-1/recipes/recipe-1" />,
		);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		await vi.waitFor(() => {
			expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes/recipe-1');
		});
	});

	it('Cancel navigates to redirectTo when provided', () => {
		render(
			<RecipeForm {...defaultProps} redirectTo="/planner-1/recipes/recipe-1" />,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes/recipe-1');
	});
});
