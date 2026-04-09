import { fireEvent, render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { PlannerItem } from './PlannerItem';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const mockUseRenamePlanner = vi.fn();
vi.mock('./useRenamePlanner', () => ({
	useRenamePlanner: (...args: unknown[]) => mockUseRenamePlanner(...args),
}));

const id = '507f1f77bcf86cd799439011';
const name = "Ariel's Planner";

const notEditingState = {
	editing: false,
	name,
	setName: vi.fn(),
	loading: false,
	error: null,
	enterEditing: vi.fn(),
	cancel: vi.fn(),
	save: vi.fn(),
};

const editingState = {
	...notEditingState,
	editing: true,
};

describe('PlannerItem', () => {
	test('renders planner link and rename button when not editing', () => {
		mockUseRenamePlanner.mockReturnValue(notEditingState);

		render(<PlannerItem id={id} name={name} />);

		const link = screen.getByTestId('planner-link');
		expect(link.getAttribute('href')).toBe(`/${id}/calendar`);
		expect(link.textContent).toBe(name);
		expect(screen.getByTestId('rename-button')).toBeDefined();
	});

	test('passes id and name to useRenamePlanner', () => {
		mockUseRenamePlanner.mockReturnValue(notEditingState);

		render(<PlannerItem id={id} name={name} />);

		expect(mockUseRenamePlanner).toHaveBeenCalledWith(id, name);
	});

	test('renders name input, save, and cancel when editing', () => {
		mockUseRenamePlanner.mockReturnValue(editingState);

		render(<PlannerItem id={id} name={name} />);

		expect(screen.getByTestId('planner-name-input')).toBeDefined();
		expect(screen.getByTestId('save-name-button')).toBeDefined();
		expect(screen.getByTestId('cancel-rename-button')).toBeDefined();
	});

	test('renders error alert when editing and error is set', () => {
		mockUseRenamePlanner.mockReturnValue({
			...editingState,
			error: 'Invalid name',
		});

		render(<PlannerItem id={id} name={name} />);

		expect(screen.getByTestId('rename-error')).toBeDefined();
	});

	test('does not render error alert when no error', () => {
		mockUseRenamePlanner.mockReturnValue(editingState);

		render(<PlannerItem id={id} name={name} />);

		expect(screen.queryByTestId('rename-error')).toBeNull();
	});

	test('calls setName when input changes', () => {
		const setName = vi.fn();
		mockUseRenamePlanner.mockReturnValue({ ...editingState, setName });

		render(<PlannerItem id={id} name={name} />);

		fireEvent.change(screen.getByTestId('planner-name-input'), {
			target: { value: 'New Name' },
		});

		expect(setName).toHaveBeenCalledWith('New Name');
	});
});
