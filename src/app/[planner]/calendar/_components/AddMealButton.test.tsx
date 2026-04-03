import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { AddMealButton } from './AddMealButton';

vi.mock('@mantine/core', () => ({
	Button: ({
		children,
		onClick,
		'data-testid': testId,
	}: {
		children: React.ReactNode;
		onClick?: () => void;
		'data-testid'?: string;
	}) => (
		<button data-testid={testId} onClick={onClick} type="button">
			{children}
		</button>
	),
	Modal: ({
		opened,
		onClose,
		children,
	}: {
		opened: boolean;
		onClose: () => void;
		children: React.ReactNode;
	}) =>
		opened ? (
			<div data-testid="modal">
				<button data-testid="modal-close" type="button" onClick={onClose} />
				{children}
			</div>
		) : null,
}));

vi.mock('./AddMealForm', () => ({
	AddMealForm: ({ onClose }: { onClose?: () => void }) => (
		<div data-testid="add-meal-form">
			<button data-testid="form-close" type="button" onClick={onClose} />
		</div>
	),
}));

describe('AddMealButton', () => {
	test('renders a button with the correct label', () => {
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	test('modal is closed before clicking the button', () => {
		render(<AddMealButton />);
		expect(screen.queryByTestId('modal')).toBeNull();
		expect(screen.queryByTestId('add-meal-form')).toBeNull();
	});

	test('clicking the button opens the modal', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		expect(screen.getByTestId('add-meal-form')).toBeDefined();
	});

	test('modal onClose closes the modal', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		fireEvent.click(screen.getByTestId('modal-close'));
		expect(screen.queryByTestId('add-meal-form')).toBeNull();
	});

	test('form onClose closes the modal', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		fireEvent.click(screen.getByTestId('form-close'));
		expect(screen.queryByTestId('add-meal-form')).toBeNull();
	});
});
