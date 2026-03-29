import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { SavedList } from './SavedList';

vi.mock('@mantine/core', () => ({
	List: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
	ListItem: ({ children }: { children: React.ReactNode }) => (
		<li>{children}</li>
	),
	Group: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
	ActionIcon: ({
		children,
		disabled,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		'data-testid'?: string;
	}) => (
		<button data-testid={testId} disabled={disabled} type="button">
			{children}
		</button>
	),
}));

vi.mock('@tabler/icons-react', () => ({
	IconPencil: () => null,
}));

vi.mock('./DeleteRecipeButton', () => ({
	DeleteRecipeButton: ({
		disabled,
		plannerId,
		recipeId,
	}: {
		disabled?: boolean;
		plannerId: string;
		recipeId: string;
	}) => (
		<button
			data-plannerid={plannerId}
			data-recipeid={recipeId}
			data-testid="delete-button"
			disabled={disabled}
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

const makeRecipe = (id: string, name: string) => ({
	_id: id as never,
	name,
	ingredients: [],
	instructions: [],
});

const makeBookmark = (id: string, name: string, url: string) => ({
	_id: id as never,
	name,
	url,
	tags: [],
});

describe('SavedList', () => {
	test('renders empty list without crashing', () => {
		const { container } = render(
			<SavedList items={[]} plannerId={plannerId} />,
		);
		expect(container.querySelector('ul')).toBeDefined();
	});

	test('renders recipe name as internal link', () => {
		const recipe = makeRecipe(
			'507f1f77bcf86cd799439012',
			"Maleficent's Dragon Roast",
		);
		render(<SavedList items={[recipe]} plannerId={plannerId} />);

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
		render(<SavedList items={[bookmark]} plannerId={plannerId} />);

		const link = screen.getByRole('link', { name: "Ursula's Sea Witch Soup" });
		expect(link.getAttribute('href')).toBe('https://example.com/soup');
		expect(link.getAttribute('target')).toBe('_blank');
	});

	test('edit button for recipe is a link to the edit modal URL', () => {
		const recipe = makeRecipe('507f1f77bcf86cd799439012', "Gaston's Baguette");
		render(<SavedList items={[recipe]} plannerId={plannerId} />);

		const editButton = screen.getByTestId('edit-button');
		expect(editButton.tagName).toBe('A');
		expect(editButton.getAttribute('href')).toBe(
			`?item=${recipe._id}&status=edit&type=recipe`,
		);
	});

	test('edit button for bookmark is disabled', () => {
		const bookmark = makeBookmark(
			'507f1f77bcf86cd799439013',
			"Ursula's Sea Witch Soup",
			'https://example.com/soup',
		);
		render(<SavedList items={[bookmark]} plannerId={plannerId} />);

		const editButton = screen.getByTestId('edit-button');
		expect((editButton as HTMLButtonElement).disabled).toBe(true);
	});

	test('passes disabled=false to DeleteRecipeButton for recipes', () => {
		const recipe = makeRecipe('507f1f77bcf86cd799439012', "Gaston's Baguette");
		render(<SavedList items={[recipe]} plannerId={plannerId} />);

		const deleteButton = screen.getByTestId('delete-button');
		expect((deleteButton as HTMLButtonElement).disabled).toBe(false);
		expect(deleteButton.getAttribute('data-plannerid')).toBe(plannerId);
		expect(deleteButton.getAttribute('data-recipeid')).toBe(recipe._id);
	});

	test('passes disabled=true to DeleteRecipeButton for bookmarks', () => {
		const bookmark = makeBookmark(
			'507f1f77bcf86cd799439013',
			"Ursula's Sea Witch Soup",
			'https://example.com/soup',
		);
		render(<SavedList items={[bookmark]} plannerId={plannerId} />);

		const deleteButton = screen.getByTestId('delete-button');
		expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
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
		render(<SavedList items={items} plannerId={plannerId} />);

		expect(
			screen.getByRole('link', { name: "Maleficent's Dragon Roast" }),
		).toBeDefined();
		expect(
			screen.getByRole('link', { name: "Ursula's Sea Witch Soup" }),
		).toBeDefined();
	});
});
