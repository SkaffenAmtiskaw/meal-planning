import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PillButton } from './PillButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('./PillButton.module.css', () => ({
	default: {
		root: 'pill-root',
		sm: 'sm',
		md: 'md',
		dashed: 'dashed',
		outline: 'outline',
	},
}));

const defaultProps = {
	children: 'Pill label',
	onClick: vi.fn(),
	'data-testid': 'pill-button-0',
};

describe('PillButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('calls onClick when the button is clicked', () => {
		const onClick = vi.fn();
		render(<PillButton {...defaultProps} onClick={onClick} />);

		fireEvent.click(screen.getByTestId('pill-button-0'));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it('does not call onClick when the button is disabled', () => {
		const onClick = vi.fn();
		render(<PillButton {...defaultProps} onClick={onClick} disabled />);

		fireEvent.click(screen.getByTestId('pill-button-0'));
		expect(onClick).not.toHaveBeenCalled();
	});

	it('exposes the supplied title attribute', () => {
		render(<PillButton {...defaultProps} title="Tooltip text" />);

		expect(screen.getByTestId('pill-button-0').getAttribute('title')).toBe(
			'Tooltip text',
		);
	});
});
