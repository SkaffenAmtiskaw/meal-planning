import { MantineProvider } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { StringArrayInput } from './StringArrayInput';

const wrapper = ({ children }: { children: React.ReactNode }) => (
	<MantineProvider>{children}</MantineProvider>
);

describe('StringArrayInput', () => {
	test('renders label when provided', () => {
		render(
			<StringArrayInput value={[]} onChange={vi.fn()} label="Ingredients" />,
			{ wrapper },
		);
		expect(screen.getByText('Ingredients')).toBeDefined();
	});

	test('renders no label when not provided', () => {
		const { container } = render(
			<StringArrayInput value={[]} onChange={vi.fn()} />,
			{ wrapper },
		);
		expect(container.querySelector('label')).toBeNull();
	});

	test('renders existing items as inputs', () => {
		render(
			<StringArrayInput
				value={['flour', 'sugar']}
				onChange={vi.fn()}
				placeholder="e.g. 1 cup flour"
			/>,
			{ wrapper },
		);
		expect(screen.getByDisplayValue('flour')).toBeDefined();
		expect(screen.getByDisplayValue('sugar')).toBeDefined();
	});

	test('renders placeholder on text inputs', () => {
		render(
			<StringArrayInput
				value={['a']}
				onChange={vi.fn()}
				placeholder="Enter item"
			/>,
			{ wrapper },
		);
		expect(screen.getByPlaceholderText('Enter item')).toBeDefined();
	});

	test('calls onChange when an item text changes', () => {
		const onChange = vi.fn();
		render(<StringArrayInput value={['flour']} onChange={onChange} />, {
			wrapper,
		});

		fireEvent.change(screen.getByDisplayValue('flour'), {
			target: { value: 'sugar' },
		});

		expect(onChange).toHaveBeenCalledWith(['sugar']);
	});

	test('calls onChange with item removed when remove button is clicked', () => {
		const onChange = vi.fn();
		render(
			<StringArrayInput
				value={['flour', 'sugar']}
				onChange={onChange}
				data-testid="sai"
			/>,
			{ wrapper },
		);

		const removeButtons = screen
			.getAllByRole('button')
			.filter((b) => !b.textContent?.includes('Add'));
		fireEvent.click(removeButtons[0]);

		expect(onChange).toHaveBeenCalledWith(['sugar']);
	});

	test('calls onChange with empty string appended when Add is clicked', () => {
		const onChange = vi.fn();
		render(<StringArrayInput value={['flour']} onChange={onChange} />, {
			wrapper,
		});

		fireEvent.click(screen.getByRole('button', { name: /add/i }));

		expect(onChange).toHaveBeenCalledWith(['flour', '']);
	});
});
