import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { useCalendarModal } from './CalendarModalContext';
import { CalendarModalProvider } from './CalendarModalProvider';
import { CalendarModals } from './CalendarModals';

import { AddMealModal } from '../AddMealModal/AddMealModal';
import { MealDetailModal } from '../MealDetailModal/MealDetailModal';

vi.mock('../AddMealModal/AddMealModal', () => ({
	AddMealModal: vi.fn(() => null),
}));

vi.mock('../MealDetailModal/MealDetailModal', () => ({
	MealDetailModal: vi.fn(() => null),
}));

const mockAddMealModal = vi.mocked(AddMealModal);
const mockMealDetailModal = vi.mocked(MealDetailModal);

const wrapper = ({ children }: { children: ReactNode }) => (
	<CalendarModalProvider>
		{children}
		<CalendarModals plannerId="planner-123" />
	</CalendarModalProvider>
);

describe('CalendarModals', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('renders each frame closed while no modal is open', () => {
		renderHook(() => useCalendarModal(), { wrapper });

		expect(mockAddMealModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: null, plannerId: 'planner-123' }),
			undefined,
		);
	});

	it("gives the open type's frame its data, and keeps the others closed", () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('meal_detail', { mealId: 'meal-1' });
		});

		expect(mockMealDetailModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: { mealId: 'meal-1' } }),
			undefined,
		);
		expect(mockAddMealModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: null }),
			undefined,
		);
	});

	it("closes the frame through the close it's given", () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});
		act(() => {
			mockAddMealModal.mock.lastCall?.[0].close();
		});

		expect(result.current.state).toEqual({ type: null, data: null });
		expect(mockAddMealModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: null }),
			undefined,
		);
	});
});
