import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { PlannerListActions } from './PlannerListActions';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

const { mockOpen, mockClose, mockUseDisclosure } = vi.hoisted(() => {
	const mockOpen = vi.fn();
	const mockClose = vi.fn();
	const mockUseDisclosure = vi.fn(() => [
		false,
		{ open: mockOpen, close: mockClose },
	]);
	return { mockOpen, mockClose, mockUseDisclosure };
});

vi.mock('@mantine/hooks', () => ({
	useDisclosure: mockUseDisclosure,
}));

vi.mock('./CreatePlannerForm', () => ({
	CreatePlannerForm: ({
		opened,
		onClose,
	}: {
		opened: boolean;
		onClose: () => void;
	}) => (
		<div data-testid="create-planner-form" data-opened={String(opened)}>
			<button type="button" data-testid="form-close" onClick={onClose} />
		</div>
	),
}));

vi.mock('@tabler/icons-react', () => ({
	IconPlus: () => <svg data-testid="icon-plus" />,
}));

describe('PlannerListActions', () => {
	afterEach(() => {
		vi.clearAllMocks();
		mockUseDisclosure.mockReturnValue([
			false,
			{ open: mockOpen, close: mockClose },
		]);
	});

	test('renders new planner button', () => {
		render(<PlannerListActions />);

		expect(screen.getByTestId('new-planner-button')).toBeDefined();
	});

	test('renders new planner FAB', () => {
		render(<PlannerListActions />);

		expect(screen.getByTestId('new-planner-fab')).toBeDefined();
	});

	test('opens modal when new planner button is clicked', () => {
		render(<PlannerListActions />);
		fireEvent.click(screen.getByTestId('new-planner-button'));

		expect(mockOpen).toHaveBeenCalled();
	});

	test('opens modal when FAB is clicked', () => {
		render(<PlannerListActions />);
		fireEvent.click(screen.getByTestId('new-planner-fab'));

		expect(mockOpen).toHaveBeenCalled();
	});

	test('passes opened=true to CreatePlannerForm when open', () => {
		mockUseDisclosure.mockReturnValueOnce([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(<PlannerListActions />);

		expect(
			screen.getByTestId('create-planner-form').getAttribute('data-opened'),
		).toBe('true');
	});

	test('passes opened=false to CreatePlannerForm when closed', () => {
		render(<PlannerListActions />);

		expect(
			screen.getByTestId('create-planner-form').getAttribute('data-opened'),
		).toBe('false');
	});

	test('passes close to CreatePlannerForm onClose', () => {
		mockUseDisclosure.mockReturnValueOnce([
			true,
			{ open: mockOpen, close: mockClose },
		]);

		render(<PlannerListActions />);
		fireEvent.click(screen.getByTestId('form-close'));

		expect(mockClose).toHaveBeenCalled();
	});
});
