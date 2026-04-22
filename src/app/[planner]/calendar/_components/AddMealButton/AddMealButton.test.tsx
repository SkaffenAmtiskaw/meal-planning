import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AddMealButton } from './AddMealButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockAddMealForm = vi.fn();
vi.mock('../AddMealForm/AddMealForm', () => ({
	AddMealForm: (props: {
		onClose?: () => void;
		onMealAdded?: (cal: unknown[]) => void;
	}) => {
		mockAddMealForm(props);
		return (
			<div data-testid="add-meal-form">
				<button
					data-testid="form-close"
					type="button"
					onClick={props.onClose}
				/>
			</div>
		);
	},
}));

const { mockUseCanWrite } = vi.hoisted(() => ({
	mockUseCanWrite: vi.fn(),
}));

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: mockUseCanWrite,
}));

describe('AddMealButton', () => {
	beforeEach(() => {
		mockUseCanWrite.mockReturnValue(true);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders a button with the correct label', () => {
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	test('modal is closed before clicking the button', () => {
		render(<AddMealButton />);
		expect(screen.queryByRole('dialog')).toBeNull();
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
		fireEvent.click(screen.getByRole('button', { name: /close/i }));
		expect(screen.queryByRole('dialog')).toBeNull();
	});

	test('form onClose closes the modal', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		fireEvent.click(screen.getByTestId('form-close'));
		expect(screen.queryByTestId('add-meal-form')).toBeNull();
	});

	test('passes onMealAdded to AddMealForm', () => {
		const onMealAdded = vi.fn();
		render(<AddMealButton onMealAdded={onMealAdded} />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		expect(mockAddMealForm).toHaveBeenCalledWith(
			expect.objectContaining({ onMealAdded }),
		);
	});

	test('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);
		render(<AddMealButton />);
		expect(screen.queryByTestId('add-meal-button')).toBeNull();
	});

	test('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
	});
});
