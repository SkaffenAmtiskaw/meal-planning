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
	IconTrash: () => null,
}));

const plannerId = '507f1f77bcf86cd799439011';

const makeRecipe = (id: string, name: string) => ({
	_id: { toString: () => id },
	name,
	ingredients: [],
	instructions: [],
});

const makeBookmark = (id: string, name: string, url: string) => ({
	_id: { toString: () => id },
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

	test('edit and delete buttons are present and disabled until edit/delete functionality is implemented', () => {
		const recipe = makeRecipe('507f1f77bcf86cd799439012', "Gaston's Baguette");
		render(<SavedList items={[recipe]} plannerId={plannerId} />);

		const editButton = screen.getByTestId('edit-button');
		expect(editButton).toBeDefined();
		expect((editButton as HTMLButtonElement).disabled).toBe(true);

		const deleteButton = screen.getByTestId('delete-button');
		expect(deleteButton).toBeDefined();
		expect((deleteButton as HTMLButtonElement).disabled).toBe(true);
	});

	test.skip('clicking edit opens edit modal for the item', () => {
		// TODO: implement when edit recipe/bookmark functionality is added
	});

	test.skip('clicking delete removes the item from the list', () => {
		// TODO: implement when delete recipe/bookmark functionality is added
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
