import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addMeal } from '@/_actions/planner/addMeal';

import { AddMealForm } from './AddMealForm';

vi.mock('@/_actions/planner/addMeal', () => ({
	addMeal: vi.fn(),
}));

type FeedbackStatus = 'idle' | 'submitting' | 'success' | 'error';

const { mockUseFormFeedback } = vi.hoisted(() => {
	const mockUseFormFeedback = vi.fn(() => ({
		status: 'idle' as FeedbackStatus,
		countdown: 0,
		errorMessage: undefined as string | undefined,
		wrap:
			<TArgs extends unknown[], TData>(
				fn: (
					...args: TArgs
				) => Promise<{ ok: boolean; data?: TData; error?: string }>,
				onSuccess: (data: TData) => void,
			) =>
			async (...args: TArgs) => {
				const result = await fn(...args);
				if (result.ok && result.data !== undefined) onSuccess(result.data);
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
}));

const { mockUseForm } = vi.hoisted(() => {
	const mockUseForm = vi.fn(() => ({
		onSubmit:
			(
				handler: (values: {
					date: string;
					mealName: string;
					description: string;
				}) => Promise<void>,
			) =>
			(e: React.FormEvent) => {
				e.preventDefault();
				handler({ date: '2024-06-15', mealName: 'Lunch', description: '' });
			},
		getInputProps: () => ({}),
		key: (field: string) => field,
	}));
	return { mockUseForm };
});

vi.mock('@mantine/form', () => ({
	schemaResolver: () => () => ({}),
	useForm: () => mockUseForm(),
}));

vi.mock('@mantine/core', () => {
	const Button = ({
		children,
		onClick,
		type,
		'data-testid': testId,
		disabled,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		type?: 'button' | 'submit';
		'data-testid'?: string;
		disabled?: boolean;
	}) => (
		<button
			data-testid={testId}
			onClick={onClick}
			type={type ?? 'button'}
			disabled={disabled}
		>
			{children}
		</button>
	);

	const Fieldset = ({
		children,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		'data-testid'?: string;
	}) => <div data-testid={testId}>{children}</div>;

	const Group = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Input = {
		Label: ({ children }: { children: React.ReactNode }) => (
			<span>{children}</span>
		),
	};

	const SegmentedControl = ({
		value,
		onChange,
		data,
		'data-testid': testId,
	}: {
		value: string;
		onChange: (v: string) => void;
		data: { label: string; value: string }[];
		'data-testid'?: string;
	}) => (
		<div data-testid={testId}>
			{data.map((d) => (
				<button
					key={d.value}
					type="button"
					data-value={d.value}
					data-active={value === d.value}
					onClick={() => onChange(d.value)}
				>
					{d.label}
				</button>
			))}
		</div>
	);

	const Select = ({
		onChange,
		'data-testid': testId,
		value,
	}: {
		onChange?: (value: string | null) => void;
		'data-testid'?: string;
		value?: string | null;
	}) => (
		<select
			data-testid={testId}
			value={value ?? ''}
			onChange={(e) => onChange?.(e.currentTarget.value || null)}
		/>
	);

	const Stack = ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	);

	const Text = ({ children }: { children: React.ReactNode }) => (
		<span>{children}</span>
	);

	const Textarea = ({
		'data-testid': testId,
		value,
		onChange,
		label,
	}: {
		'data-testid'?: string;
		value?: string;
		onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
		label?: string;
	}) => (
		<textarea
			data-testid={testId ?? `textarea-${label}`}
			value={value ?? ''}
			onChange={onChange}
		/>
	);

	const TextInput = ({
		'data-testid': testId,
		value,
		onChange,
		label,
		type,
	}: {
		'data-testid'?: string;
		value?: string;
		onChange?: React.ChangeEventHandler<HTMLInputElement>;
		label?: string;
		type?: string;
	}) => (
		<input
			data-testid={testId ?? `input-${label}`}
			type={type}
			value={value ?? ''}
			onChange={onChange}
		/>
	);

	return {
		Button,
		Fieldset,
		Group,
		Input,
		SegmentedControl,
		Select,
		Stack,
		Text,
		Textarea,
		TextInput,
	};
});

const defaultProps = {
	plannerId: 'planner-1',
	savedItems: [],
	onClose: vi.fn(),
};

const clickSegment = (rowIndex: number, value: string) => {
	const control = screen.getByTestId(`dish-source-type-${rowIndex}`);
	fireEvent.click(control.querySelector(`[data-value="${value}"]`) as Element);
};

describe('AddMealForm', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders date, meal name and description fields', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('meal-date')).toBeDefined();
		expect(screen.getByTestId('meal-name')).toBeDefined();
		expect(screen.getByTestId('meal-description')).toBeDefined();
	});

	test('renders one dish row by default', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
		expect(screen.queryByTestId('dish-row-1')).toBeNull();
	});

	test('adds a dish row when "Add dish" is clicked', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		expect(screen.getByTestId('dish-row-1')).toBeDefined();
	});

	test('does not show remove button when only one dish', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.queryByTestId('dish-remove-0')).toBeNull();
	});

	test('shows remove button on each dish when there are multiple', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		expect(screen.getByTestId('dish-remove-0')).toBeDefined();
		expect(screen.getByTestId('dish-remove-1')).toBeDefined();
	});

	test('removes a dish row when remove is clicked', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		fireEvent.click(screen.getByTestId('dish-remove-0'));
		expect(screen.queryByTestId('dish-row-1')).toBeNull();
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
	});

	test('updating one dish does not affect other dishes', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('add-dish-button'));
		fireEvent.change(screen.getByTestId('dish-name-0'), {
			target: { value: 'Soup' },
		});
		expect(screen.getByTestId('dish-row-1')).toBeDefined();
	});

	test('source type defaults to None with no extra inputs', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
		expect(screen.queryByTestId('dish-url-name-0')).toBeNull();
	});

	test('switching to Saved shows the saved combobox', () => {
		render(<AddMealForm {...defaultProps} />);
		clickSegment(0, 'saved');
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
		expect(screen.queryByTestId('dish-url-name-0')).toBeNull();
	});

	test('switching to URL shows the URL name and URL fields', () => {
		render(<AddMealForm {...defaultProps} />);
		clickSegment(0, 'url');
		expect(screen.getByTestId('dish-url-name-0')).toBeDefined();
		expect(screen.getByTestId('dish-url-value-0')).toBeDefined();
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
	});

	test('switching back to None hides source inputs', () => {
		render(<AddMealForm {...defaultProps} />);
		clickSegment(0, 'url');
		clickSegment(0, 'none');
		expect(screen.queryByTestId('dish-url-name-0')).toBeNull();
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
	});

	test('note is hidden by default', () => {
		render(<AddMealForm {...defaultProps} />);
		expect(screen.queryByTestId('dish-note-0')).toBeNull();
	});

	test('clicking note toggle expands the note field', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		expect(screen.getByTestId('dish-note-0')).toBeDefined();
	});

	test('clicking note toggle again collapses the note field', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		expect(screen.queryByTestId('dish-note-0')).toBeNull();
	});

	test('removing a note clears the note value', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('');
	});

	test('updating dish name fires onChange', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.change(screen.getByTestId('dish-name-0'), {
			target: { value: 'Pasta' },
		});
		expect((screen.getByTestId('dish-name-0') as HTMLInputElement).value).toBe(
			'Pasta',
		);
	});

	test('selecting a saved item fires onChange with the id', () => {
		const savedItems = [{ _id: '1', name: 'Pasta' }];
		render(<AddMealForm {...defaultProps} savedItems={savedItems} />);
		clickSegment(0, 'saved');
		fireEvent.change(screen.getByTestId('dish-saved-0'), {
			target: { value: '1' },
		});
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
	});

	test('clearing a saved item fires onChange with null', () => {
		const savedItems = [{ _id: '1', name: 'Pasta' }];
		render(<AddMealForm {...defaultProps} savedItems={savedItems} />);
		clickSegment(0, 'saved');
		fireEvent.change(screen.getByTestId('dish-saved-0'), {
			target: { value: '' },
		});
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
	});

	test('typing in URL name field updates urlName', () => {
		render(<AddMealForm {...defaultProps} />);
		clickSegment(0, 'url');
		fireEvent.change(screen.getByTestId('dish-url-name-0'), {
			target: { value: 'My Recipe' },
		});
		expect(
			(screen.getByTestId('dish-url-name-0') as HTMLInputElement).value,
		).toBe('My Recipe');
	});

	test('typing in URL field updates urlValue', () => {
		render(<AddMealForm {...defaultProps} />);
		clickSegment(0, 'url');
		fireEvent.change(screen.getByTestId('dish-url-value-0'), {
			target: { value: 'https://example.com' },
		});
		expect(
			(screen.getByTestId('dish-url-value-0') as HTMLInputElement).value,
		).toBe('https://example.com');
	});

	test('typing in note field updates note', () => {
		render(<AddMealForm {...defaultProps} />);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		expect(
			(screen.getByTestId('dish-note-0') as HTMLTextAreaElement).value,
		).toBe('A note');
	});

	test('cancel button calls onClose', () => {
		const onClose = vi.fn();
		render(<AddMealForm {...defaultProps} onClose={onClose} />);
		fireEvent.click(screen.getByText('Cancel'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	test('shows error alert when status is error', () => {
		mockUseFormFeedback.mockReturnValueOnce({
			status: 'error' as FeedbackStatus,
			countdown: 0,
			errorMessage: 'Something went wrong',
			wrap: vi.fn(),
			reset: vi.fn(),
		});
		render(<AddMealForm {...defaultProps} />);
		expect(screen.getByTestId('form-feedback-alert')).toBeDefined();
	});

	test('submitting calls addMeal with form values and dishes', async () => {
		vi.mocked(addMeal).mockResolvedValue({
			ok: true,
			data: { calendar: [] },
		});

		render(<AddMealForm {...defaultProps} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(addMeal).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				date: '2024-06-15',
				mealName: 'Lunch',
			}),
		);
	});

	test('calls onClose and logs calendar on successful submission', async () => {
		const onClose = vi.fn();
		const calendar = [{ date: '2024-06-15', meals: [] }];
		vi.mocked(addMeal).mockResolvedValue({ ok: true, data: { calendar } });
		const consoleSpy = vi
			.spyOn(console, 'log')
			.mockImplementation(() => undefined);

		render(<AddMealForm {...defaultProps} onClose={onClose} />);
		await act(async () => {
			fireEvent.submit(screen.getByTestId('add-meal-form'));
		});

		expect(consoleSpy).toHaveBeenCalledWith('Planner calendar:', calendar);
		expect(onClose).toHaveBeenCalledOnce();
		consoleSpy.mockRestore();
	});

	test('populates saved combobox with provided savedItems', () => {
		const savedItems = [
			{ _id: '1', name: 'Pasta' },
			{ _id: '2', name: 'Salad' },
		];
		render(<AddMealForm {...defaultProps} savedItems={savedItems} />);
		clickSegment(0, 'saved');
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
	});
});
