import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseDishChip } from './BaseDishChip';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./BaseDishChip.module.css', () => ({
	default: {
		root: 'base-root',
		empty: 'empty',
		set: 'set',
	},
}));

const defaultProps = {
	children: 'Chip label',
	isEmpty: true,
	onClick: vi.fn(),
	'data-testid': 'base-dish-chip-0',
};

describe('BaseDishChip', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders the supplied children', () => {
		render(<BaseDishChip {...defaultProps}>Note</BaseDishChip>);

		expect(screen.getByTestId('base-dish-chip-0').textContent).toBe('Note');
	});

	it('applies the empty variant class when isEmpty is true', () => {
		render(<BaseDishChip {...defaultProps} isEmpty />);

		expect(screen.getByTestId('base-dish-chip-0').className).toContain(
			'base-root empty',
		);
	});

	it('applies the set variant class when isEmpty is false', () => {
		render(<BaseDishChip {...defaultProps} isEmpty={false} />);

		expect(screen.getByTestId('base-dish-chip-0').className).toContain(
			'base-root set',
		);
	});

	it('calls onClick when the chip is clicked', () => {
		const onClick = vi.fn();
		render(<BaseDishChip {...defaultProps} onClick={onClick} />);

		fireEvent.click(screen.getByTestId('base-dish-chip-0'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('exposes the supplied title attribute', () => {
		render(<BaseDishChip {...defaultProps} title="Tooltip text" />);

		expect(screen.getByTestId('base-dish-chip-0').getAttribute('title')).toBe(
			'Tooltip text',
		);
	});

	it('applies an additional className when provided', () => {
		render(
			<BaseDishChip
				{...defaultProps}
				className="extra-class"
				isEmpty={false}
			/>,
		);

		const chip = screen.getByTestId('base-dish-chip-0');
		expect(chip.className).toContain('base-root');
		expect(chip.className).toContain('set');
		expect(chip.className).toContain('extra-class');
	});
});
