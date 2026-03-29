import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { RecipeDetail } from './RecipeDetail';

const mockUseMantineTheme = vi.fn(() => ({
	colors: {} as Record<string, string[]>,
}));
const mockIsLightColor = vi.fn(() => false);

vi.mock('@mantine/core', () => {
	const Anchor = ({
		children,
		href,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		href?: string;
		'data-testid'?: string;
	}) => (
		<a data-testid={testId} href={href}>
			{children}
		</a>
	);

	const Badge = ({
		children,
		style,
	}: {
		children: React.ReactNode;
		style?: React.CSSProperties;
	}) => <span style={style}>{children}</span>;

	const Button = ({
		children,
		disabled,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		disabled?: boolean;
		'data-testid'?: string;
	}) => (
		<button type="button" data-testid={testId} disabled={disabled}>
			{children}
		</button>
	);

	const Container = ({
		children,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		'data-testid'?: string;
	}) => <div data-testid={testId}>{children}</div>;

	const Group = ({
		children,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		'data-testid'?: string;
	}) => <div data-testid={testId}>{children}</div>;

	const List = ({
		children,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		'data-testid'?: string;
	}) => <ul data-testid={testId}>{children}</ul>;

	const ListItem = ({ children }: { children: React.ReactNode }) => (
		<li>{children}</li>
	);

	const SimpleGrid = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Stack = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Text = ({
		children,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		'data-testid'?: string;
	}) => <span data-testid={testId}>{children}</span>;

	const Title = ({ children }: { children: React.ReactNode }) => (
		<h2>{children}</h2>
	);

	return {
		Anchor,
		Badge,
		Button,
		Container,
		Group,
		isLightColor: (bg: string) => mockIsLightColor(bg),
		List,
		ListItem,
		SimpleGrid,
		Stack,
		Text,
		Title,
		useMantineTheme: () => mockUseMantineTheme(),
	};
});

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
		mockUseMantineTheme.mockReturnValue({ colors: {} });
		mockIsLightColor.mockReturnValue(false);
	});
	test('renders the recipe name', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByText("Maleficent's Dragon Roast")).toBeDefined();
	});

	test('renders the outermost container with data-testid', () => {
		render(<RecipeDetail {...defaultProps} />);
		expect(screen.getByTestId('recipe-detail')).toBeDefined();
	});

	test('renders a disabled edit button', () => {
		render(<RecipeDetail {...defaultProps} />);
		const btn = screen.getByTestId('edit-button') as HTMLButtonElement;
		expect(btn).toBeDefined();
		expect(btn.disabled).toBe(true);
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
		expect(link.textContent).toBe('Dark Cookbook');
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

	test('renders notes when provided', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, notes: 'Best served at midnight' }}
			/>,
		);
		expect(screen.getByTestId('notes').textContent).toBe(
			'Best served at midnight',
		);
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
		expect(screen.queryByTestId('notes')).toBeNull();
		expect(screen.queryByTestId('storage')).toBeNull();
		expect(screen.queryByTestId('tags')).toBeNull();
	});

	test('renders resolved tag pills', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1', name: 'Spicy', color: 'red' }]}
			/>,
		);
		expect(screen.getByTestId('tags')).toBeDefined();
		expect(screen.getByText('Spicy')).toBeDefined();
	});

	test('does not render tags section when recipe has no tags', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				tags={[{ _id: 'tag-1', name: 'Spicy', color: 'red' }]}
			/>,
		);
		expect(screen.queryByTestId('tags')).toBeNull();
	});

	test('applies theme color when tag color exists in theme palette', () => {
		mockUseMantineTheme.mockReturnValue({
			colors: { red: ['', '', '', '', '', '#cc0000'] },
		});
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1', name: 'Spicy', color: 'red' }]}
			/>,
		);
		expect(screen.getByTestId('tags')).toBeDefined();
	});

	test('uses black text on light-colored tag pills', () => {
		mockIsLightColor.mockReturnValue(true);
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['tag-1' as never] }}
				tags={[{ _id: 'tag-1', name: 'Mild', color: 'yellow' }]}
			/>,
		);
		expect(screen.getByText('Mild')).toBeDefined();
	});

	test('does not render tags section when tag ids do not match available tags', () => {
		render(
			<RecipeDetail
				{...defaultProps}
				recipe={{ ...baseRecipe, tags: ['unknown-id' as never] }}
				tags={[{ _id: 'tag-1', name: 'Spicy', color: 'red' }]}
			/>,
		);
		expect(screen.queryByTestId('tags')).toBeNull();
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
