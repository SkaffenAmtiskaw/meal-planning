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

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

const { mockUseFormFeedback } = vi.hoisted(() => {
	const mockUseFormFeedback = vi.fn(() => ({
		status: 'idle' as FeedbackStatus,
		countdown: 0,
		errorMessage: undefined as string | undefined,
		wrap:
			(fn: (...args: unknown[]) => Promise<void>, onSuccess: () => void) =>
			async (...args: unknown[]) => {
				await fn(...args);
				onSuccess();
			},
		reset: vi.fn(),
	}));
	return { mockUseFormFeedback };
});

vi.mock('@/_hooks', () => ({
	useFormFeedback: () => mockUseFormFeedback(),
}));

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

vi.mock('mantine-form-zod-resolver', () => ({
	zod4Resolver: () => () => ({}),
}));

const { mockUseForm } = vi.hoisted(() => {
	const mockUseForm = vi.fn(() => ({
		onSubmit:
			(handler: (values: Record<string, unknown>) => Promise<void>) =>
			(e: React.FormEvent) => {
				e.preventDefault();
				handler({});
			},
		getInputProps: () => ({}),
		key: (field: string) => field,
	}));
	return { mockUseForm };
});

vi.mock('@mantine/form', () => ({
	useForm: () => mockUseForm(),
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

	test('submits source as undefined when source name is empty', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({ source: { name: '', url: '' } });
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ source: undefined }),
		);
	});

	test('submits source with name and no url when url is empty', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({ source: { name: 'Book', url: '' } });
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ source: { name: 'Book', url: undefined } }),
		);
	});

	test('submits source with url when both fields are filled', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({
						source: { name: 'Bon Appétit', url: 'https://example.com' },
					});
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({
				source: { name: 'Bon Appétit', url: 'https://example.com' },
			}),
		);
	});

	test('submits time as undefined when all time fields are empty', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({ time: { prep: '', cook: '', total: '', actual: '' } });
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({ time: undefined }),
		);
	});

	test('submits time with only non-empty fields when some are filled', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({
						time: { prep: '10m', cook: '', total: '10m', actual: '' },
					});
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({
				time: { prep: '10m', cook: undefined, total: '10m', actual: undefined },
			}),
		);
	});

	test('submits time with cook only when prep and total are empty', async () => {
		vi.mocked(addRecipe).mockResolvedValue({
			ok: true,
			data: { _id: 'id', name: 'x' },
		});
		mockUseForm.mockReturnValueOnce({
			onSubmit:
				(handler: (values: Record<string, unknown>) => Promise<void>) =>
				(e: React.FormEvent) => {
					e.preventDefault();
					handler({
						time: { prep: '', cook: '30m', total: '', actual: '' },
					});
				},
			getInputProps: () => ({}),
			key: (field: string) => field,
		});
		render(<RecipeForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('recipe-form'));
		});
		expect(addRecipe).toHaveBeenCalledWith(
			expect.objectContaining({
				time: {
					prep: undefined,
					cook: '30m',
					total: undefined,
					actual: undefined,
				},
			}),
		);
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
		mockUseFormFeedback.mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<RecipeForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});
});
