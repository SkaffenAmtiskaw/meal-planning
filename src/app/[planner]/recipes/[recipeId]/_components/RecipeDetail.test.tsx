import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/saved';

import { RecipeDetail } from './RecipeDetail';

vi.mock('@/_components', () => ({
	ConfirmButton: ({
		onConfirm,
		onSuccess,
		renderTrigger,
	}: {
		onConfirm: () => Promise<{ ok: boolean; data: undefined }>;
		onSuccess?: () => void;
		renderTrigger: (onOpen: () => void) => React.ReactNode;
	}) => {
		const handleClick = async () => {
			const result = await onConfirm();
			if (result?.ok) {
				onSuccess?.();
			}
		};
		return <>{renderTrigger(handleClick)}</>;
	},
}));

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/_actions/saved', () => ({
	deleteRecipe: vi.fn(),
}));

vi.mock('./KeepAwakeToggle', () => ({
	KeepAwakeToggle: () => <div data-testid="keep-awake-toggle" />,
}));

vi.mock('./InlineNotesEditor', () => ({
	InlineNotesEditor: ({
		notes,
		plannerId,
		recipeId,
	}: {
		notes?: string;
		plannerId: string;
		recipeId: string;
	}) => (
		<div
			data-testid="inline-notes-editor"
			data-notes={notes}
			data-planner-id={plannerId}
			data-recipe-id={recipeId}
		/>
	),
}));

vi.mock('./InlineTagsEditor', () => ({
	InlineTagsEditor: ({
		tagIds,
		availableTags,
		plannerId,
		recipeId,
	}: {
		tagIds: string[];
		availableTags: { _id: string }[];
		plannerId: string;
		recipeId: string;
	}) => (
		<div
			data-testid="inline-tags-editor"
			data-tag-ids={tagIds.join(',')}
			data-available-tags-count={availableTags.length}
			data-planner-id={plannerId}
			data-recipe-id={recipeId}
		/>
	),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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
	afterEach(() => {
		vi.resetAllMocks();
	});
	test('renders the recipe name', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByText("Maleficent's Dragon Roast")).toBeDefined();
	});

	test('renders the outermost container with data-testid', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('recipe-detail')).toBeDefined();
	});

	test('renders an enabled edit button', () => {
		render(<RecipeDetail {...defaultProps} />);
		const btn = screen.getByTestId('edit-button') as HTMLButtonElement;
		expect(btn).toBeDefined();
		expect(btn.disabled).toBe(false);
	});

	test('clicking edit button navigates to ?status=edit', () => {
		render(<RecipeDetail {...defaultProps} />);
		fireEvent.click(screen.getByTestId('edit-button'));
		expect(mockPush).toHaveBeenCalledWith('?status=edit');
	});

	test('renders a delete button', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('delete-button')).toBeDefined();
	});

	test('clicking delete calls deleteRecipe action and redirects to recipes list', async () => {
		vi.mocked(deleteRecipe).mockResolvedValueOnce({
			ok: true,
			data: undefined,
		});
		render(<RecipeDetail {...defaultProps} />);

		fireEvent.click(screen.getByTestId('delete-button'));

		await waitFor(() => {
			expect(deleteRecipe).toHaveBeenCalledWith({
				plannerId: 'planner-1',
				recipeId: 'recipe-1',
			});
			expect(mockPush).toHaveBeenCalledWith('/planner-1/recipes');
		});
	});

	test('renders the keep awake toggle', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('keep-awake-toggle')).toBeDefined();
	});

	test('renders ingredients list', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('ingredients-list')).toBeDefined();
		expect(screen.getByText('2 dragon scales')).toBeDefined();
		expect(screen.getByText('1 cup dark broth')).toBeDefined();
	});

	test('renders instructions list', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('instructions-list')).toBeDefined();
		expect(screen.getByText('Heat cauldron')).toBeDefined();
		expect(screen.getByText('Add ingredients')).toBeDefined();
	});

	test('renders source as link when url is present', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					source: { name: 'Dark Cookbook', url: 'https://example.com' },
				}}
			/>,
		);
		const link = screen.getByTestId('source-link') as HTMLAnchorElement;
		expect(link.href).toBe('https://example.com/');
		expect(link.textContent).toBe('https://example.com');
		expect(screen.getByTestId('source-name').textContent).toBe('Dark Cookbook');
	});

	test('renders source as plain text when no url', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					source: { name: 'Secret Grimoire' },
				}}
			/>,
		);
		expect(screen.getByTestId('source-name').textContent).toBe(
			'Secret Grimoire',
		);
		expect(screen.queryByTestId('source-link')).toBeNull();
	});

	test('renders time fields when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{
					...baseRecipe,
					time: { prep: '15m', cook: '1h', total: '1h15m', actual: '1h30m' },
				}}
			/>,
		);
		expect(screen.getByTestId('time-prep').textContent).toBe('15m');
		expect(screen.getByTestId('time-cook').textContent).toBe('1h');
		expect(screen.getByTestId('time-total').textContent).toBe('1h15m');
		expect(screen.getByTestId('time-actual').textContent).toBe('1h30m');
	});

	test('renders partial time fields', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, time: { prep: '10m' } }}
			/>,
		);
		expect(screen.getByTestId('time-prep').textContent).toBe('10m');
		expect(screen.queryByTestId('time-cook')).toBeNull();
		expect(screen.queryByTestId('time-total')).toBeNull();
		expect(screen.queryByTestId('time-actual')).toBeNull();
	});

	test('renders servings when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, servings: 4 }}
			/>,
		);
		expect(screen.getByTestId('servings').textContent).toBe('4');
	});

	test('renders inline notes editor with notes prop', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, notes: 'Best served at midnight' }}
			/>,
		);
		const editor = screen.getByTestId('inline-notes-editor');
		expect(editor.getAttribute('data-notes')).toBe('Best served at midnight');
	});

	test('renders inline notes editor without notes', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('inline-notes-editor')).toBeDefined();
	});

	test('passes plannerId and recipeId to inline notes editor', () => {
		render(<RecipeDetail {...defaultProps} />);
		const editor = screen.getByTestId('inline-notes-editor');
		expect(editor.getAttribute('data-planner-id')).toBe('planner-1');
		expect(editor.getAttribute('data-recipe-id')).toBe('recipe-1');
	});

	test('renders storage when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, storage: 'Keep in enchanted chest' }}
			/>,
		);
		expect(screen.getByTestId('storage').textContent).toBe(
			'Keep in enchanted chest',
		);
	});

	test('does not render optional sections when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('source-link')).toBeNull();
		expect(screen.queryByTestId('source-name')).toBeNull();
		expect(screen.queryByTestId('time-prep')).toBeNull();
		expect(screen.queryByTestId('servings')).toBeNull();
		expect(screen.queryByTestId('storage')).toBeNull();
	});

	test('renders InlineTagsEditor', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('inline-tags-editor')).toBeDefined();
	});

	test('passes empty tagIds when recipe has no tags', () => {
		render(<RecipeDetail {...defaultProps} />);
		const editor = screen.getByTestId('inline-tags-editor');
		expect(editor.getAttribute('data-tag-ids')).toBe('');
	});

	test('passes recipe tag ids to InlineTagsEditor', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1' as never, name: 'Spicy', color: 'tangerine' }]}
			/>,
		);
		expect(
			screen.getByTestId('inline-tags-editor').getAttribute('data-tag-ids'),
		).toBe('tag-1');
	});

	test('passes available tags to InlineTagsEditor', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				tags={[{ _id: 'tag-1' as never, name: 'Spicy', color: 'tangerine' }]}
			/>,
		);
		expect(
			screen
				.getByTestId('inline-tags-editor')
				.getAttribute('data-available-tags-count'),
		).toBe('1');
	});

	test('passes plannerId and recipeId to InlineTagsEditor', () => {
		render(<RecipeDetail {...defaultProps} />);
		const editor = screen.getByTestId('inline-tags-editor');
		expect(editor.getAttribute('data-planner-id')).toBe('planner-1');
		expect(editor.getAttribute('data-recipe-id')).toBe('recipe-1');
	});

	test('does not render ingredients section when list is empty', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, ingredients: [] }}
			/>,
		);
		expect(screen.queryByTestId('ingredients-list')).toBeNull();
	});

	test('does not render instructions section when list is empty', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, instructions: [] }}
			/>,
		);
		expect(screen.queryByTestId('instructions-list')).toBeNull();
	});
});
