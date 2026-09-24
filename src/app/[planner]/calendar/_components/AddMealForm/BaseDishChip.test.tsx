import type { ReactNode } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseDishChip } from './BaseDishChip';

vi.mock('@/_components/PillButton', () => ({
	PillButton: vi.fn(
		({
			children,
			onClick,
			'data-testid': testId,
			title,
			className,
			variant,
			size,
		}: {
			children?: ReactNode;
			onClick?: () => void;
			'data-testid'?: string;
			title?: string;
			className?: string;
			variant?: string;
			size?: string;
		}) => (
			<button
				type="button"
				onClick={onClick}
				data-testid={testId}
				title={title}
				data-variant={variant}
				data-size={size}
				className={className}
			>
				{children}
			</button>
		),
	),
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

	it('passes variant dashed when isEmpty is true', () => {
		render(<BaseDishChip {...defaultProps} isEmpty />);

		expect(
			screen.getByTestId('base-dish-chip-0').getAttribute('data-variant'),
		).toBe('dashed');
	});

	it('passes variant outline when isEmpty is false', () => {
		render(<BaseDishChip {...defaultProps} isEmpty={false} />);

		expect(
			screen.getByTestId('base-dish-chip-0').getAttribute('data-variant'),
		).toBe('outline');
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
		expect(chip.className).toContain('extra-class');
	});
});
