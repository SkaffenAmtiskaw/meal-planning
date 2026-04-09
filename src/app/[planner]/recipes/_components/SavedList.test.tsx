import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { SavedList } from './SavedList';

vi.mock('@mantine/core', () => ({
	List: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
	Group: ({ children }: { children: React.ReactNode }) => <>{children}</>,
	Badge: ({
		children,
		color,
	}: {
		children: React.ReactNode;
		color: string;
	}) => (
		<span data-color={color} data-testid="badge">
			{children}
		</span>
	),
	Anchor: ({
		children,
		href,
		target,
	}: {
		children: React.ReactNode;
		href: string;
		target?: string;
	}) => (
		<a href={href} target={target}>
			{children}
		</a>
	),
}));

vi.mock('@/_components', () => ({
	FullWidthListItem: ({ children }: { children: React.ReactNode }) => (
		<li>{children}</li>
	),
}));

vi.mock('./DeleteBookmarkButton', () => ({
	DeleteBookmarkButton: ({
		plannerId,
		bookmarkId,
	}: {
		plannerId: string;
		bookmarkId: string;
	}) => (
		<button
			data-bookmarkid={bookmarkId}
			data-plannerid={plannerId}
			data-testid="delete-bookmark-button"
			type="button"
		/>
	),
}));

vi.mock('./DeleteRecipeButton', () => ({
	DeleteRecipeButton: ({
		plannerId,
		recipeId,
	}: {
		plannerId: string;
		recipeId: string;
	}) => (
		<button
			data-plannerid={plannerId}
			data-recipeid={recipeId}
			data-testid="delete-recipe-button"
			type="button"
		/>
	),
}));

vi.mock('./EditRecipeButton', () => ({
	EditRecipeButton: ({ href }: { href: string }) => (
		<a data-testid="edit-button" href={href}>
			edit
		</a>
	),
}));

const plannerId = '507f1f77bcf86cd799439011';

const makeRecipe = (id: string, name: string, tagIds: string[] = []) => ({
	_id: id as never,
	name,
	ingredients: [],
	instructions: [],
	tags: tagIds as never[],
});

const makeBookmark = (id: string, name: string, url: string) => ({
	_id: id as never,
	name,
	url,
	tags: [],
});

const makeTag = (id: string, name: string, color: string) => ({
	_id: id as never,
	name,
	color,
});

describe('SavedList', () => {
	test('renders empty list without crashing', () => {
		const { container } = render(
			<SavedList items={[]} plannerId={plannerId} tags={[]} />,
		);
		expect(container.querySelector('ul')).toBeDefined();
	});

	test('renders recipe name as internal link', () => {
		const recipe = makeRecipe(
			'507f1f77bcf86cd799439012',
			"Maleficent's Dragon Roast",
		);
		render(<SavedList items={[recipe]} plannerId={plannerId} tags={[]} />);

		const link = screen.getByRole('link', {
			name: "Maleficent's Dragon Roast",
		});
		expect(link.getAttribute('href')).toBe(
			`/${plannerId}/recipes/${recipe._id}`,
		);
		expect(link.getAttribute('target')).toBeNull();
	});

	test('renders bookmark name as external link', () => {
		const bookmark = makeBookmark(
			'507f1f77bcf86cd799439013',
			"Ursula's Sea Witch Soup",
			'https://example.com/soup',
		);
		render(<SavedList items={[bookmark]} plannerId={plannerId} tags={[]} />);

		const link = screen.getByRole('link', { name: "Ursula's Sea Witch Soup" });
		expect(link.getAttribute('href')).toBe('https://example.com/soup');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('edit button for recipe is a link to the edit modal URL', () => {
		const recipe = makeRecipe('507f1f77bcf86cd799439012', "Gaston's Baguette");
		render(<SavedList items={[recipe]} plannerId={plannerId} tags={[]} />);

		const editButton = screen.getByTestId('edit-button');
		expect(editButton.tagName).toBe('A');
		expect(editButton.getAttribute('href')).toBe(
			`?item=${recipe._id}&status=edit&type=recipe`,
		);
	});

	test('edit button for bookmark is a link to the edit modal URL', () => {
		const bookmark = makeBookmark(
			'507f1f77bcf86cd799439013',
			"Ursula's Sea Witch Soup",
			'https://example.com/soup',
		);
		render(<SavedList items={[bookmark]} plannerId={plannerId} tags={[]} />);

		const editButton = screen.getByTestId('edit-button');
		expect(editButton.getAttribute('href')).toBe(
			`?item=${bookmark._id}&status=edit&type=bookmark`,
		);
	});

	test('renders DeleteRecipeButton for recipes', () => {
		const recipe = makeRecipe('507f1f77bcf86cd799439012', "Gaston's Baguette");
		render(<SavedList items={[recipe]} plannerId={plannerId} tags={[]} />);

		const deleteButton = screen.getByTestId('delete-recipe-button');
		expect(deleteButton.getAttribute('data-plannerid')).toBe(plannerId);
		expect(deleteButton.getAttribute('data-recipeid')).toBe(recipe._id);
	});

	test('renders DeleteBookmarkButton for bookmarks', () => {
		const bookmark = makeBookmark(
			'507f1f77bcf86cd799439013',
			"Ursula's Sea Witch Soup",
			'https://example.com/soup',
		);
		render(<SavedList items={[bookmark]} plannerId={plannerId} tags={[]} />);

		const deleteButton = screen.getByTestId('delete-bookmark-button');
		expect(deleteButton.getAttribute('data-plannerid')).toBe(plannerId);
		expect(deleteButton.getAttribute('data-bookmarkid')).toBe(bookmark._id);
	});

	test('renders multiple items', () => {
		const items = [
			makeRecipe('507f1f77bcf86cd799439012', "Maleficent's Dragon Roast"),
			makeBookmark(
				'507f1f77bcf86cd799439013',
				"Ursula's Sea Witch Soup",
				'https://example.com/soup',
			),
		];
		render(<SavedList items={items} plannerId={plannerId} tags={[]} />);

		expect(
			screen.getByRole('link', { name: "Maleficent's Dragon Roast" }),
		).toBeDefined();
		expect(
			screen.getByRole('link', { name: "Ursula's Sea Witch Soup" }),
		).toBeDefined();
	});

	test('renders badges for matching tags on a recipe', () => {
		const tagId = '507f1f77bcf86cd799439020';
		const tag = makeTag(tagId, 'Vegetarian', '#00aa00');
		const recipe = makeRecipe('507f1f77bcf86cd799439012', 'Salad', [tagId]);
		render(<SavedList items={[recipe]} plannerId={plannerId} tags={[tag]} />);

		const badge = screen.getByTestId('badge');
		expect(badge.textContent).toBe('Vegetarian');
		expect(badge.getAttribute('data-color')).toBe('#00aa00');
	});

	test('renders no badges when item has no matching tags', () => {
		const tag = makeTag('507f1f77bcf86cd799439020', 'Vegetarian', '#00aa00');
		const recipe = makeRecipe('507f1f77bcf86cd799439012', 'Salad');
		render(<SavedList items={[recipe]} plannerId={plannerId} tags={[tag]} />);

		expect(screen.queryByTestId('badge')).toBeNull();
	});

	test('renders no badges when item tags is undefined', () => {
		const tag = makeTag('507f1f77bcf86cd799439020', 'Vegetarian', '#00aa00');
		const recipe = {
			...makeRecipe('507f1f77bcf86cd799439012', 'Salad'),
			tags: undefined,
		};
		render(
			<SavedList
				items={[recipe as never]}
				plannerId={plannerId}
				tags={[tag]}
			/>,
		);

		expect(screen.queryByTestId('badge')).toBeNull();
	});

	test('renders multiple badges when item has multiple matching tags', () => {
		const tag1 = makeTag('507f1f77bcf86cd799439020', 'Vegetarian', '#00aa00');
		const tag2 = makeTag('507f1f77bcf86cd799439021', 'Quick', '#0000aa');
		const recipe = makeRecipe('507f1f77bcf86cd799439012', 'Salad', [
			'507f1f77bcf86cd799439020',
			'507f1f77bcf86cd799439021',
		]);
		render(
			<SavedList items={[recipe]} plannerId={plannerId} tags={[tag1, tag2]} />,
		);

		const badges = screen.getAllByTestId('badge');
		expect(badges).toHaveLength(2);
	});
});
