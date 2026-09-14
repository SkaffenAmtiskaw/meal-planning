import { useState } from 'react';
import type { ReactElement } from 'react';

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { act, fireEvent, render, screen } from '@testing-library/react';

import { DateTime } from 'luxon';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ListView } from '@/_components/Calendar';
import { useCanWrite } from '@/app/[planner]/_components';

import { MealListView } from './MealListView';

import type { SerializedDay } from '../../_utils/toScheduleXEvents';
import {
	AddMealFormModalWrapper,
	type AddMealFormModalWrapperProps,
} from '../AddMealFormModalWrapper/AddMealFormModalWrapper';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

vi.mock('@/_components/Calendar', async () => ({
	ListView: vi.fn(() => <div data-testid="list-view" />),
}));

vi.mock('@/app/[planner]/_components', async () => ({
	useCanWrite: vi.fn(() => true),
}));

vi.mock('../AddMealFormModalWrapper/AddMealFormModalWrapper', async () => ({
	AddMealFormModalWrapper: vi.fn(() => (
		<div data-testid="add-meal-form-modal-wrapper" />
	)),
}));

const mockUseCanWrite = vi.mocked(useCanWrite);
const mockListView = vi.mocked(ListView);
const mockModal = vi.mocked(Modal);
const mockAddMealFormModalWrapper = vi.mocked(AddMealFormModalWrapper);

const plannerId = 'planner-123';
const onMealAdded = vi.fn();

function ListViewDayTrigger({
	onAddMeal,
	date,
}: {
	onAddMeal?: (date: DateTime) => void;
	date: DateTime;
}): ReactElement {
	return (
		<button
			type="button"
			data-testid="day-trigger"
			onClick={() => onAddMeal?.(date)}
		>
			Add meal
		</button>
	);
}

describe('MealListView', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseCanWrite.mockReturnValue(true);
		vi.mocked(useDisclosure).mockImplementation((initialState = false) => {
			const [opened, setOpened] = useState(initialState);
			return [
				opened,
				{
					open: () => setOpened(true),
					close: () => setOpened(false),
					toggle: () => setOpened((current) => !current),
					set: (value: boolean) => setOpened(value),
				},
			];
		});
	});

	it('renders ListView', () => {
		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		expect(screen.getByTestId('list-view')).toBeDefined();
	});

	it('passes onAddMeal to ListView when user has write access', () => {
		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: expect.any(Function) }),
			undefined,
		);
	});

	it('does not pass onAddMeal to ListView when user has read-only access', () => {
		mockUseCanWrite.mockReturnValue(false);

		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		expect(mockListView).toHaveBeenCalledTimes(1);
		expect(mockListView).toHaveBeenCalledWith(
			expect.objectContaining({ onAddMeal: undefined }),
			undefined,
		);
	});

	it('opens the modal with the correct initialDate when a day trigger is clicked', () => {
		const date = DateTime.local(2024, 6, 15);

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();
		expect(mockModal).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Add Meal',
				size: 'lg',
				opened: true,
			}),
			undefined,
		);
		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId,
				initialDate: date.toISODate(),
				onMealAdded,
			}),
			undefined,
		);
	});

	it('falls back to undefined initialDate when the date is invalid', () => {
		const invalidDate = DateTime.invalid('invalid');

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={invalidDate} />
		));

		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(mockAddMealFormModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({
				initialDate: undefined,
			}),
			undefined,
		);
	});

	it('propagates onMealAdded and closes the modal via onClose', () => {
		const date = DateTime.local(2024, 6, 15);
		const calendar: SerializedDay[] = [];

		mockListView.mockImplementation(({ onAddMeal }) => (
			<ListViewDayTrigger onAddMeal={onAddMeal} date={date} />
		));

		render(<MealListView plannerId={plannerId} onMealAdded={onMealAdded} />);

		fireEvent.click(screen.getByTestId('day-trigger'));

		expect(screen.getByRole('dialog')).toBeDefined();

		const wrapperProps = mockAddMealFormModalWrapper.mock
			.calls[0][0] as AddMealFormModalWrapperProps;

		wrapperProps.onMealAdded?.(calendar);
		expect(onMealAdded).toHaveBeenCalledWith(calendar);

		act(() => {
			wrapperProps.onClose();
		});
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
