import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DishSourceChip } from './DishSourceChip';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const defaultProps = {
	label: 'Add source',
	sourceType: 'none' as const,
	isEmpty: true,
	onClick: vi.fn(),
	'data-testid': 'dish-source-chip-0',
};

describe('DishSourceChip', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the supplied label', () => {
		render(
			<DishSourceChip
				{...defaultProps}
				label="Pasta Primavera"
				isEmpty={false}
				sourceType="saved"
			/>,
		);

		expect(screen.getByTestId('dish-source-chip-0').textContent).toBe(
			'Pasta Primavera',
		);
	});

	it('renders Add source label when given an empty none source', () => {
		render(<DishSourceChip {...defaultProps} />);

		expect(screen.getByTestId('dish-source-chip-0').textContent).toBe(
			'Add source',
		);
	});

	it('calls onClick when the chip is clicked', () => {
		const onClick = vi.fn();
		render(<DishSourceChip {...defaultProps} onClick={onClick} />);

		fireEvent.click(screen.getByTestId('dish-source-chip-0'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('exposes the supplied title attribute', () => {
		render(
			<DishSourceChip
				{...defaultProps}
				label="Pasta Primavera"
				title="Pasta Primavera"
				isEmpty={false}
				sourceType="saved"
			/>,
		);

		expect(screen.getByTestId('dish-source-chip-0').getAttribute('title')).toBe(
			'Pasta Primavera',
		);
	});

	it('has no title attribute when title is omitted', () => {
		render(<DishSourceChip {...defaultProps} />);

		expect(
			screen.getByTestId('dish-source-chip-0').getAttribute('title'),
		).toBeNull();
	});

	it('renders long labels without breaking', () => {
		const longText = 'a'.repeat(200);
		render(
			<DishSourceChip
				{...defaultProps}
				label={longText}
				isEmpty={false}
				sourceType="text"
			/>,
		);

		expect(screen.getByTestId('dish-source-chip-0').textContent).toBe(longText);
	});

	it('renders for each source type', () => {
		const { rerender } = render(<DishSourceChip {...defaultProps} />);
		expect(screen.getByTestId('dish-source-chip-0')).toBeDefined();

		rerender(
			<DishSourceChip
				{...defaultProps}
				label="Saved item"
				isEmpty={false}
				sourceType="saved"
			/>,
		);
		expect(screen.getByTestId('dish-source-chip-0')).toBeDefined();

		rerender(
			<DishSourceChip
				{...defaultProps}
				label="example.com"
				isEmpty={false}
				sourceType="text"
			/>,
		);
		expect(screen.getByTestId('dish-source-chip-0')).toBeDefined();
	});
});
