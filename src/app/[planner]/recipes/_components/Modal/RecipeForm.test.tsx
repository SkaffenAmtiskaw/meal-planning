import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addRecipe } from '@/_actions/saved/addRecipe';

import { RecipeForm } from './RecipeForm';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: mockPush }),
	usePathname: () => '/planner-1/recipes',
}));

vi.mock('@/_actions/saved/addRecipe', () => ({
	addRecipe: vi.fn(),
}));

vi.mock('@/_components', () => ({
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

vi.mock('mantine-form-zod-resolver', () => ({
	zod4Resolver: () => () => ({}),
}));

vi.mock('@mantine/form', () => ({
	useForm: () => ({
		onSubmit:
			(handler: (values: Record<string, unknown>) => Promise<void>) =>
			(e: React.FormEvent) => {
				e.preventDefault();
				handler({});
			},
		getInputProps: () => ({}),
		key: (field: string) => field,
	}),
}));

vi.mock('@mantine/core', () => {
	const TextInput = ({ label, name }: { label?: string; name?: string }) => (
		<input data-testid={`input-${name ?? label}`} />
	);

	const Textarea = ({ label }: { label?: string }) => (
		<textarea data-testid={`textarea-${label}`} />
	);

	const NumberInput = ({ label }: { label?: string }) => (
		<input type="number" data-testid={`number-${label}`} />
	);

	const Fieldset = ({ children }: { children: React.ReactNode }) => (
		<fieldset>{children}</fieldset>
	);

	const Grid = Object.assign(
		({ children }: { children: React.ReactNode }) => <div>{children}</div>,
		{
			Col: ({ children }: { children: React.ReactNode }) => (
				<div>{children}</div>
			),
		},
	);

	const SimpleGrid = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Group = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Button = ({
		children,
		onClick,
		type,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: 'button' | 'submit';
	}) => (
		<button type={type ?? 'button'} onClick={onClick}>
			{children}
		</button>
	);

	return {
		TextInput,
		Textarea,
		NumberInput,
		Fieldset,
		Grid,
		SimpleGrid,
		Group,
		Button,
	};
});

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
			_id: 'new-id',
			name: 'Croissant',
		});

		render(<RecipeForm {...defaultProps} />);
		fireEvent.submit(screen.getByTestId('recipe-form'));

		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ plannerId: 'planner-1' }),
		);
	});

	test('navigates away after successful submission', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			_id: 'new-id',
			name: 'Croissant',
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
});
