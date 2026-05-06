import { useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/library';
import { ConfirmButton } from '@/_components';

import { RecipeDetail } from './RecipeDetail';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

vi.mock('@/_components', () => ({
	ConfirmButton: vi.fn(({ renderTrigger }) => renderTrigger?.(() => {})),
}));

vi.mock('./KeepAwakeToggle', () => ({
	KeepAwakeToggle: () => <div data-testid="keep-awake-toggle" />,
}));

vi.mock('./InlineNotesEditor', () => ({
	InlineNotesEditor: () => <div data-testid="inline-notes-editor" />,
}));

vi.mock('./InlineTagsEditor', () => ({
	InlineTagsEditor: () => <div data-testid="inline-tags-editor" />,
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockPush = vi.fn();

const baseRecipe = {
	_id: 'recipe-1' as never,
	name: "Maleficent's Dragon Roast",
	ingredients: ['2 dragon scales', '1 cup dark broth'],
	instructions: ['Heat cauldron', 'Add ingredients'],
};

const defaultProps = {
	plannerId: 'planner-1',
	recipe: baseRecipe,
	tags: [],
};

describe('RecipeDetail', () => {
	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('navigates to edit page when edit button is clicked', () => {
		render(<RecipeDetail {...defaultProps} />);
		fireEvent.click(screen.getByTestId('edit-button'));
		expect(mockPush).toHaveBeenCalledWith('?status=edit');
	});

	it('calls deleteRecipe and redirects on successful delete', async () => {
		render(<RecipeDetail {...defaultProps} />);

		const call = vi.mocked(ConfirmButton).mock.calls[0][0];
		await call.onConfirm();

		expect(deleteRecipe).toHaveBeenCalledWith({
			plannerId: 'planner-1',
			recipeId: 'recipe-1',
		});

		call.onSuccess?.();
		expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
	});

	it('renders source section when source and url are present', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					source: { name: 'Dark Cookbook', url: 'https://example.com' },
				}}
			/>,
		);
		expect(screen.getByTestId('source-name')).toBeDefined();
		expect(screen.getByTestId('source-link')).toBeDefined();
	});

	it('renders source section without url when url is absent', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					source: { name: 'Secret Grimoire' },
				}}
			/>,
		);
		expect(screen.getByTestId('source-name')).toBeDefined();
		expect(screen.queryByTestId('source-link')).toBeNull();
	});

	it('does not render source section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('source-name')).toBeNull();
		expect(screen.queryByTestId('source-link')).toBeNull();
	});

	it('renders time section when time fields are present', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					time: { prep: '15m', cook: '1h', total: '1h15m', actual: '1h30m' },
				}}
			/>,
		);
		expect(screen.getByTestId('time-prep')).toBeDefined();
		expect(screen.getByTestId('time-cook')).toBeDefined();
		expect(screen.getByTestId('time-total')).toBeDefined();
		expect(screen.getByTestId('time-actual')).toBeDefined();
	});

	it('does not render time subfields when not provided', () => {
		render(
			<RecipeDetail {...defaultProps} recipe={{ ...baseRecipe, time: {} }} />,
		);
		expect(screen.queryByTestId('time-prep')).toBeNull();
		expect(screen.queryByTestId('time-cook')).toBeNull();
		expect(screen.queryByTestId('time-total')).toBeNull();
		expect(screen.queryByTestId('time-actual')).toBeNull();
	});

	it('does not render time section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('time-prep')).toBeNull();
	});

	it('renders servings section when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, servings: 4 }}
			/>,
		);
		expect(screen.getByTestId('servings')).toBeDefined();
	});

	it('does not render servings section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('servings')).toBeNull();
	});

	it('renders ingredients section when provided', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('ingredients-list')).toBeDefined();
	});

	it('does not render ingredients section when empty', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, ingredients: [] }}
			/>,
		);
		expect(screen.queryByTestId('ingredients-list')).toBeNull();
	});

	it('renders instructions section when provided', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('instructions-list')).toBeDefined();
	});

	it('does not render instructions section when empty', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, instructions: [] }}
			/>,
		);
		expect(screen.queryByTestId('instructions-list')).toBeNull();
	});

	it('renders storage section when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, storage: 'Keep in enchanted chest' }}
			/>,
		);
		expect(screen.getByTestId('storage')).toBeDefined();
	});

	it('does not render storage section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('storage')).toBeNull();
	});

	it('renders inline tags editor with transformed tags and recipe tag ids', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1' as never, name: 'Spicy', color: 'tangerine' }]}
			/>,
		);
		expect(screen.getByTestId('inline-tags-editor')).toBeDefined();
	});
});
