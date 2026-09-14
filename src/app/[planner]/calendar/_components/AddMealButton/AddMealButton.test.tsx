import { type ReactElement, useState } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AddMealButton } from './AddMealButton';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const { mockUseCanWrite } = vi.hoisted(() => ({
	mockUseCanWrite: vi.fn(),
}));

vi.mock('@/app/[planner]/_components', () => ({
	useCanWrite: mockUseCanWrite,
}));

const mockControlledModal = vi.fn();
vi.mock('../ControlledModal/ControlledModal', () => ({
	ControlledModal: (props: {
		trigger: (args: { onOpen: () => void }) => ReactElement;
		children: (args: { onClose: () => void }) => ReactElement;
	}) => {
		mockControlledModal(props);
		const [opened, setOpened] = useState(false);

		return (
			<div data-opened={opened} data-testid="controlled-modal">
				{props.trigger({ onOpen: () => setOpened(true) })}
				{opened ? (
					<div data-testid="controlled-modal-content">
						{props.children({ onClose: () => setOpened(false) })}
					</div>
				) : null}
			</div>
		);
	},
}));

const mockAddMealFormModalWrapper = vi.fn();
vi.mock('../AddMealFormModalWrapper/AddMealFormModalWrapper', () => ({
	AddMealFormModalWrapper: (props: {
		plannerId: string;
		onMealAdded?: (calendar: unknown[]) => void;
		onClose: () => void;
	}) => {
		mockAddMealFormModalWrapper(props);

		return (
			<div data-testid="add-meal-form-modal-wrapper">
				<button
					type="button"
					data-testid="wrapper-success"
					onClick={() => props.onMealAdded?.([{ id: 'day-1' }])}
				>
					Simulate success
				</button>
				<button
					type="button"
					data-testid="wrapper-cancel"
					onClick={props.onClose}
				>
					Simulate cancel
				</button>
			</div>
		);
	},
}));

describe('AddMealButton', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it('renders a button with the correct label', () => {
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
		expect(screen.getByText('Add Meal')).toBeDefined();
	});

	it('does not render when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);
		render(<AddMealButton />);
		expect(screen.queryByTestId('add-meal-button')).toBeNull();
	});

	it('renders when user has write access', () => {
		mockUseCanWrite.mockReturnValue(true);
		render(<AddMealButton />);
		expect(screen.getByTestId('add-meal-button')).toBeDefined();
	});

	it('opens the modal when the button is clicked', () => {
		render(<AddMealButton />);
		expect(screen.queryByTestId('controlled-modal-content')).toBeNull();
		fireEvent.click(screen.getByTestId('add-meal-button'));
		expect(screen.getByTestId('controlled-modal-content')).toBeDefined();
	});

	it('passes plannerId and onMealAdded to AddMealFormModalWrapper', () => {
		render(<AddMealButton />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		expect(mockAddMealFormModalWrapper).toHaveBeenLastCalledWith(
			expect.objectContaining({
				plannerId: '',
				onMealAdded: undefined,
				onClose: expect.any(Function),
			}),
		);

		const onMealAdded = vi.fn();
		render(<AddMealButton plannerId="planner-1" onMealAdded={onMealAdded} />);
		fireEvent.click(screen.getAllByTestId('add-meal-button')[1]);
		expect(mockAddMealFormModalWrapper).toHaveBeenLastCalledWith(
			expect.objectContaining({
				plannerId: 'planner-1',
				onMealAdded,
				onClose: expect.any(Function),
			}),
		);
	});

	it('calls onMealAdded when AddMealForm reports success through the wrapper', () => {
		const onMealAdded = vi.fn();
		render(<AddMealButton plannerId="planner-1" onMealAdded={onMealAdded} />);
		fireEvent.click(screen.getByTestId('add-meal-button'));
		fireEvent.click(screen.getByTestId('wrapper-success'));
		expect(onMealAdded).toHaveBeenCalledWith([{ id: 'day-1' }]);
	});

	it('passes the title and size to ControlledModal', () => {
		render(<AddMealButton />);
		expect(mockControlledModal).toHaveBeenCalledWith(
			expect.objectContaining({
				modalProps: { title: 'Add Meal', size: 'lg' },
			}),
		);
	});
});
