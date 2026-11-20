import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { useCalendarModal } from './CalendarModalContext';
import { CalendarModalProvider } from './CalendarModalProvider';

import { AddMealModal } from '../AddMealForm/AddMealModal';

vi.mock('../AddMealForm/AddMealModal', () => ({
	AddMealModal: vi.fn(() => null),
}));

const mockAddMealModal = vi.mocked(AddMealModal);

describe('CalendarModalProvider', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	const wrapper = ({ children }: { children: ReactNode }) => (
		<CalendarModalProvider plannerId="planner-123">
			{children}
		</CalendarModalProvider>
	);

	it('renders each frame closed while no modal is open', () => {
		renderHook(() => useCalendarModal(), { wrapper });

		expect(mockAddMealModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: null }),
			undefined,
		);
	});

	it("gives the open type's frame its data", () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', { initialDate: '2024-01-15' });
		});

		expect(mockAddMealModal).toHaveBeenLastCalledWith(
			expect.objectContaining({ data: { initialDate: '2024-01-15' } }),
			undefined,
		);
	});

	it('closes the frame when close is called', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});
		act(() => {
			result.current.close();
		});

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
	});
});
