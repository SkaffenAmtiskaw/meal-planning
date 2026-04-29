import { type ReactNode, useContext } from 'react';

import { act, renderHook } from '@testing-library/react';

import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { CalendarContext, type CalendarViewType } from './CalendarContext';
import {
	CalendarProvider,
	type CalendarProviderProps,
} from './CalendarProvider';

// Wrapper component to capture context updates
function createTestWrapper(
	props: Omit<CalendarProviderProps, 'children'> = {},
) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <CalendarProvider {...props}>{children}</CalendarProvider>;
	};
}

// Hook to extract context for testing
function useTestContext() {
	const context = useContext(CalendarContext);
	if (!context) {
		throw new Error('Context not found');
	}
	return context;
}

describe('CalendarProvider', () => {
	describe('initial state', () => {
		it('should default selectedDate to now', () => {
			const beforeTest = DateTime.now();

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			const afterTest = DateTime.now();

			// The selectedDate should be between beforeTest and afterTest
			expect(result.current.selectedDate.toMillis()).toBeGreaterThanOrEqual(
				beforeTest.toMillis(),
			);
			expect(result.current.selectedDate.toMillis()).toBeLessThanOrEqual(
				afterTest.toMillis(),
			);
		});

		it('should accept initialDate prop', () => {
			const initialDate = DateTime.local(2024, 6, 15);

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialDate }),
			});

			expect(result.current.selectedDate.toISODate()).toBe('2024-06-15');
		});

		it('should default viewType to month', () => {
			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			expect(result.current.viewType).toBe('month');
		});

		it('should accept initialView prop', () => {
			const initialView: CalendarViewType = 'week';

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialView }),
			});

			expect(result.current.viewType).toBe('week');
		});
	});

	describe('navigation', () => {
		describe('goToToday', () => {
			it('should set selectedDate to now', () => {
				const initialDate = DateTime.local(2020, 1, 1);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate }),
				});

				expect(result.current.selectedDate.toISODate()).toBe('2020-01-01');

				const beforeTest = DateTime.now();

				act(() => {
					result.current.goToToday();
				});

				const afterTest = DateTime.now();

				expect(result.current.selectedDate.toMillis()).toBeGreaterThanOrEqual(
					beforeTest.toMillis(),
				);
				expect(result.current.selectedDate.toMillis()).toBeLessThanOrEqual(
					afterTest.toMillis(),
				);
			});
		});

		describe('goToPrevious', () => {
			it('should subtract 1 month in month view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'month' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-05-15');
			});

			it('should subtract 7 days in week view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'week' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-08');
			});

			it('should subtract 1 day in list view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'list' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-14');
			});
		});

		describe('goToNext', () => {
			it('should add 1 month in month view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'month' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-07-15');
			});

			it('should add 7 days in week view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'week' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-22');
			});

			it('should add 1 day in list view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'list' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-16');
			});
		});
	});

	describe('view switching', () => {
		it('should update viewType when setViewType called', () => {
			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialView: 'month' }),
			});

			expect(result.current.viewType).toBe('month');

			act(() => {
				result.current.setViewType('week');
			});

			expect(result.current.viewType).toBe('week');

			act(() => {
				result.current.setViewType('list');
			});

			expect(result.current.viewType).toBe('list');
		});
	});

	describe('setSelectedDate', () => {
		it('should update selectedDate', () => {
			const initialDate = DateTime.local(2024, 6, 15);
			const newDate = DateTime.local(2024, 8, 25);

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialDate }),
			});

			expect(result.current.selectedDate.toISODate()).toBe('2024-06-15');

			act(() => {
				result.current.setSelectedDate(newDate);
			});

			expect(result.current.selectedDate.toISODate()).toBe('2024-08-25');
		});
	});
});
