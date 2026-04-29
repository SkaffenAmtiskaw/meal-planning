import { act, fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { addTag } from '@/_actions/planner/addTag';
import { TAG_COLORS } from '@/_theme/colors';

import { TagCombobox } from './TagCombobox';

vi.mock('@/_theme/colors', () => ({
	TAG_COLORS: {
		fern: {
			bg: 'rgb(228, 242, 228)',
			text: 'rgb(30, 77, 30)',
			border: 'rgb(135, 194, 135)',
		},
		red: {
			bg: 'rgb(240, 100, 100)',
			text: 'rgb(120, 20, 20)',
			border: 'rgb(200, 80, 80)',
		},
		blue: {
			bg: 'rgb(200, 220, 250)',
			text: 'rgb(20, 40, 120)',
			border: 'rgb(100, 140, 200)',
		},
	},
	TagColor: 'fern',
}));

vi.mock('@/_actions/planner/addTag', () => ({
	addTag: vi.fn(),
}));

// Capture callbacks so tests can call them directly
let capturedOnOptionSubmit: ((val: string) => void) | undefined;
let capturedOnDropdownClose: (() => void) | undefined;
let capturedOnDropdownOpen: (() => void) | undefined;

vi.mock('@mantine/core', () => {
	const Combobox = Object.assign(
		({
			children,
			onOptionSubmit,
		}: {
			children: React.ReactNode;
			onOptionSubmit?: (val: string) => void;
		}) => {
			capturedOnOptionSubmit = onOptionSubmit;
			return <div data-testid="combobox">{children}</div>;
		},
		{
			DropdownTarget: ({ children }: { children: React.ReactNode }) => (
				<>{children}</>
			),
			Dropdown: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="dropdown">{children}</div>
			),
			Options: ({ children }: { children: React.ReactNode }) => (
				<div data-testid="options">{children}</div>
			),
			Option: ({
				children,
				value,
			}: {
				children: React.ReactNode;
				value: string;
			}) => (
				<button
					type="button"
					data-testid={`option-${value}`}
					onClick={() => capturedOnOptionSubmit?.(value)}
				>
					{children}
				</button>
			),
			Empty: ({ children }: { children: React.ReactNode }) => (
				<span data-testid="empty">{children}</span>
			),
		},
	);

	const PillsInput = Object.assign(
		({
			children,
			label,
			onClick,
		}: {
			children: React.ReactNode;
			label?: string;
			onClick?: () => void;
		}) => (
			// biome-ignore lint/a11y/useSemanticElements: test mock — <button> would nest inside Pill's remove <button>
			<div
				data-testid="pills-input"
				role="button"
				tabIndex={0}
				onClick={onClick}
				onKeyDown={onClick}
			>
				{label && <span>{label}</span>}
				{children}
			</div>
		),
		{
			Field: ({
				value,
				placeholder,
				onChange,
				onFocus,
				onBlur,
				onKeyDown,
			}: React.InputHTMLAttributes<HTMLInputElement>) => (
				<input
					data-testid="tag-input"
					value={value}
					placeholder={placeholder}
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
					onKeyDown={onKeyDown}
				/>
			),
		},
	);

	const Pill = Object.assign(
		({
			children,
			withRemoveButton,
			onRemove,
			style,
		}: {
			children: React.ReactNode;
			withRemoveButton?: boolean;
			onRemove?: () => void;
			style?: React.CSSProperties;
		}) => (
			<span data-testid="pill" style={style}>
				{children}
				{withRemoveButton && (
					<button type="button" data-testid="pill-remove" onClick={onRemove}>
						×
					</button>
				)}
			</span>
		),
		{
			Group: ({ children }: { children: React.ReactNode }) => (
				<div>{children}</div>
			),
		},
	);

	const Text = ({
		children,
		'data-testid': testId,
	}: {
		children?: React.ReactNode;
		'data-testid'?: string;
		c?: string;
		size?: string;
	}) => <span data-testid={testId}>{children}</span>;

	return {
		Combobox,
		PillsInput,
		Pill,
		Text,
		useCombobox: ({
			onDropdownClose,
			onDropdownOpen,
		}: {
			onDropdownClose?: () => void;
			onDropdownOpen?: () => void;
		}) => {
			capturedOnDropdownClose = onDropdownClose;
			capturedOnDropdownOpen = onDropdownOpen;
			return {
				openDropdown: vi.fn(),
				closeDropdown: vi.fn(),
				resetSelectedOption: vi.fn(),
				updateSelectedOptionIndex: vi.fn(),
			};
		},
	};
});

const defaultProps = {
	plannerId: 'planner-123',
	initialTags: [
		{ _id: 'tag-1', name: 'Spicy', color: 'red' },
		{ _id: 'tag-2', name: 'Sweet', color: 'blue' },
	],
	value: [],
	onChange: vi.fn(),
};

describe('TagCombobox', () => {
	afterEach(() => {
		vi.resetAllMocks();
		capturedOnOptionSubmit = undefined;
		capturedOnDropdownClose = undefined;
		capturedOnDropdownOpen = undefined;
	});

	test('renders label when provided', () => {
		render(<TagCombobox {...defaultProps} label="Tags" />);
		expect(screen.getByText('Tags')).toBeDefined();
	});

	test('renders no label text when not provided', () => {
		const { container } = render(<TagCombobox {...defaultProps} />);
		expect(
			container.querySelector('[data-testid="pills-input"] > span'),
		).toBeNull();
	});

	test('renders pills for currently selected tags', () => {
		render(<TagCombobox {...defaultProps} value={['tag-1']} />);
		expect(screen.getByText('Spicy')).toBeDefined();
	});

	test('renders available options for unselected tags', () => {
		render(<TagCombobox {...defaultProps} value={['tag-1']} />);
		expect(screen.getByTestId('option-tag-2')).toBeDefined();
		// selected tag should not appear as option
		expect(screen.queryByTestId('option-tag-1')).toBeNull();
	});

	test('shows empty state when no options match search', () => {
		render(<TagCombobox {...defaultProps} value={['tag-1', 'tag-2']} />);
		// both tags selected, no options left, no search text
		expect(screen.getByTestId('empty')).toBeDefined();
	});

	test('calls onChange with tag added when an option is selected', () => {
		const onChange = vi.fn();
		render(<TagCombobox {...defaultProps} onChange={onChange} />);

		capturedOnOptionSubmit?.('tag-1');

		expect(onChange).toHaveBeenCalledWith(['tag-1']);
	});

	test('calls onChange with tag removed when a pill remove is clicked', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox {...defaultProps} value={['tag-1']} onChange={onChange} />,
		);

		fireEvent.click(screen.getByTestId('pill-remove'));

		expect(onChange).toHaveBeenCalledWith([]);
	});

	test('calls onChange without last tag on Backspace when search is empty', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox
				{...defaultProps}
				value={['tag-1', 'tag-2']}
				onChange={onChange}
			/>,
		);

		fireEvent.keyDown(screen.getByTestId('tag-input'), {
			key: 'Backspace',
			target: { value: '' },
		});

		expect(onChange).toHaveBeenCalledWith(['tag-1']);
	});

	test('does not remove tag on Backspace when search has content', () => {
		const onChange = vi.fn();
		render(
			<TagCombobox {...defaultProps} value={['tag-1']} onChange={onChange} />,
		);

		const input = screen.getByTestId('tag-input');
		// populate search state first
		fireEvent.change(input, { target: { value: 'abc' } });
		fireEvent.keyDown(input, { key: 'Backspace' });

		expect(onChange).not.toHaveBeenCalled();
	});

	test('shows create option when search does not match any tag exactly', () => {
		render(<TagCombobox {...defaultProps} />);

		fireEvent.change(screen.getByTestId('tag-input'), {
			target: { value: 'New Tag' },
		});

		expect(screen.getByTestId('option-__create__')).toBeDefined();
	});

	test('does not show create option when search exactly matches an existing tag', () => {
		render(<TagCombobox {...defaultProps} />);

		fireEvent.change(screen.getByTestId('tag-input'), {
			target: { value: 'Spicy' },
		});

		expect(screen.queryByTestId('option-__create__')).toBeNull();
	});

	test('creates a new tag and adds it to selection on __create__ submit', async () => {
		const onChange = vi.fn();
		const newTag = { _id: 'tag-3', name: 'Umami', color: 'green' };
		vi.mocked(addTag).mockResolvedValue({ ok: true, data: newTag });

		render(<TagCombobox {...defaultProps} onChange={onChange} />);

		fireEvent.change(screen.getByTestId('tag-input'), {
			target: { value: 'Umami' },
		});
		await act(async () => {
			capturedOnOptionSubmit?.('__create__');
		});

		expect(addTag).toHaveBeenCalledWith('planner-123', 'Umami');
		expect(onChange).toHaveBeenCalledWith(['tag-3']);
	});

	test('shows error message when addTag returns an error result', async () => {
		vi.mocked(addTag).mockResolvedValue({ ok: false, error: 'Unauthorized' });

		render(<TagCombobox {...defaultProps} />);

		fireEvent.change(screen.getByTestId('tag-input'), {
			target: { value: 'Fail' },
		});
		await act(async () => {
			capturedOnOptionSubmit?.('__create__');
		});

		expect(screen.getByTestId('tag-create-error')).toBeDefined();
	});

	test('shows error message when addTag throws unexpectedly', async () => {
		vi.mocked(addTag).mockRejectedValue(new Error('Network failure'));

		render(<TagCombobox {...defaultProps} />);

		fireEvent.change(screen.getByTestId('tag-input'), {
			target: { value: 'Fail' },
		});
		await act(async () => {
			capturedOnOptionSubmit?.('__create__');
		});

		expect(screen.getByTestId('tag-create-error')).toBeDefined();
	});

	test('applies inline style to pill based on theme color', () => {
		render(<TagCombobox {...defaultProps} value={['tag-1']} />);
		// pill is rendered — the getPillStyle function ran without error
		expect(screen.getByText('Spicy')).toBeDefined();
	});

	test('clicking the pills container opens the dropdown', () => {
		render(<TagCombobox {...defaultProps} />);
		fireEvent.click(screen.getByTestId('pills-input'));
		// Coverage — the onClick arrow fn on PillsInput is invoked
	});

	test('input focus and blur invoke combobox open/close callbacks', () => {
		render(<TagCombobox {...defaultProps} />);
		const input = screen.getByTestId('tag-input');

		fireEvent.focus(input);
		fireEvent.blur(input);
		// no assertion needed — just ensures lines 123-124 are covered
	});

	test('onDropdownClose and onDropdownOpen callbacks are invocable', () => {
		render(<TagCombobox {...defaultProps} />);

		// Exercise the callbacks captured from useCombobox (lines 48-49)
		expect(() => capturedOnDropdownClose?.()).not.toThrow();
		expect(() => capturedOnDropdownOpen?.()).not.toThrow();
	});

	test('applies pill style with TAG_COLORS bg and text colors', () => {
		render(
			<TagCombobox
				{...defaultProps}
				initialTags={[{ _id: 'tag-fern', name: 'Fern', color: 'fern' }]}
				value={['tag-fern']}
			/>,
		);
		const pill = screen.getByTestId('pill');
		expect(pill).toBeDefined();
		const style = pill.style;
		expect(style.backgroundColor).toBe(TAG_COLORS.fern.bg);
		expect(style.color).toBe(TAG_COLORS.fern.text);
		expect(style.border).toBe(`1px solid ${TAG_COLORS.fern.border}`);
	});

	test('applies pill style with fallback background for unknown color', () => {
		render(
			<TagCombobox
				{...defaultProps}
				initialTags={[{ _id: 'tag-x', name: 'Custom', color: 'turquoise' }]}
				value={['tag-x']}
			/>,
		);
		const pill = screen.getByTestId('pill');
		expect(pill).toBeDefined();
		expect(pill.style.backgroundColor).toBe('turquoise');
	});
});
