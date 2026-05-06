import { useRouter } from 'next/navigation';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteRecipe } from '@/_actions/saved';
import { ConfirmButton } from '@/_components';

import { RecipeDetail } from './RecipeDetail';

vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));

vi.mock('@/_actions/saved', () => ({
	deleteRecipe: vi.fn(),
}));

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
		vi.mocked(deleteRecipe).mockResolvedValue({ ok: true, data: undefined });
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

	it('renders source as link when url is present', () => {
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
		expect(screen.getByTestId('source-name').textContent).toBe('Dark Cookbook');
	});

	it('renders source name as plain text when no url', () => {
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

	it('does not render source section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('source-name')).toBeNull();
		expect(screen.queryByTestId('source-link')).toBeNull();
	});

	it('renders all time fields when provided', () => {
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

	it('renders only provided time fields', () => {
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

	it('does not render time section when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('time-prep')).toBeNull();
	});

	it('renders servings when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, servings: 4 }}
			/>,
		);
		expect(screen.getByTestId('servings').textContent).toBe('4');
	});

	it('does not render servings when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('servings')).toBeNull();
	});

	it('renders ingredients list when provided', () => {
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

	it('renders instructions list when provided', () => {
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

	it('renders storage when provided', () => {
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

	it('does not render storage when absent', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.queryByTestId('storage')).toBeNull();
	});

	it('renders inline notes editor', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('inline-notes-editor')).toBeDefined();
	});

	it('renders inline tags editor with recipe tags and available tags', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1' as never, name: 'Spicy', color: 'tangerine' }]}
			/>,
		);
		expect(screen.getByTestId('inline-tags-editor')).toBeDefined();
	});

	it('renders keep awake toggle', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('keep-awake-toggle')).toBeDefined();
	});
});
