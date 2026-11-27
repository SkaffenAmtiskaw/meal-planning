import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type ReactNode, useContext } from 'react';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { CalendarContext } from './CalendarContext';
import {
	CalendarProvider,
	type CalendarProviderProps,
} from './CalendarProvider';
import type { CalendarViewType } from './types';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

const today = DateTime.local(2024, 3, 15);

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
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('initial state', () => {
		it('should default selectedDate to today', () => {
			vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			expect(result.current.selectedDate).toBe(today);
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

		it('has no jump', () => {
			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			expect(result.current.jump).toBeNull();
		});

		it("starts on the UTC day while the viewer's day is unknown", () => {
			vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			expect(result.current.selectedDate.toISODate()).toBe('2024-03-15');
		});
	});

	describe("once the viewer's day is known", () => {
		it('moves selectedDate to today without recording a jump', () => {
			const knownToday = DateTime.local(2024, 3, 16);
			vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));
			const { result, rerender } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			vi.mocked(useToday).mockReturnValue(makeKnownDay(knownToday));
			rerender();

			expect(result.current.selectedDate).toBe(knownToday);
			expect(result.current.jump).toBeNull();
		});

		it('keeps initialDate', () => {
			const initialDate = DateTime.local(2024, 6, 15);
			vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));
			const { result, rerender } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialDate }),
			});

			vi.mocked(useToday).mockReturnValue(makeKnownDay(today));
			rerender();

			expect(result.current.selectedDate).toBe(initialDate);
		});
	});

	describe('navigateToDate', () => {
		it('selects the date and records a jump to it', () => {
			const newDate = DateTime.local(2024, 9, 20);
			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({
					initialDate: DateTime.local(2024, 6, 15),
				}),
			});

			act(() => {
				result.current.navigateToDate(newDate);
			});

			expect(result.current.selectedDate).toBe(newDate);
			expect(result.current.jump).toEqual({ date: newDate, id: 1 });
		});

		it('records a new jump each time, even to the same date', () => {
			const newDate = DateTime.local(2024, 9, 20);
			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper(),
			});

			act(() => {
				result.current.navigateToDate(newDate);
			});
			act(() => {
				result.current.navigateToDate(newDate);
			});

			expect(result.current.jump).toEqual({ date: newDate, id: 2 });
		});
	});

	describe('navigation', () => {
		describe('goToToday', () => {
			it('jumps to today', () => {
				vi.mocked(useToday).mockReturnValue(makeKnownDay(today));

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({
						initialDate: DateTime.local(2020, 1, 1),
					}),
				});

				act(() => {
					result.current.goToToday();
				});

				expect(result.current.selectedDate).toBe(today);
				expect(result.current.jump?.date).toBe(today);
			});

			it("does nothing while the viewer's day is unknown", () => {
				vi.mocked(useToday).mockReturnValue(makeUnknownDay(today));
				const initialDate = DateTime.local(2020, 1, 1);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate }),
				});

				act(() => {
					result.current.goToToday();
				});

				expect(result.current.selectedDate).toBe(initialDate);
				expect(result.current.jump).toBeNull();
			});
		});

		describe('goToPrevious', () => {
			it('jumps back 1 month in month view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'month' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-05-15');
				expect(result.current.jump?.date.toISODate()).toBe('2024-05-15');
			});

			it('jumps back 7 days in week view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'week' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-08');
			});

			it('does nothing in list view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'list' }),
				});

				act(() => {
					result.current.goToPrevious();
				});

				expect(result.current.selectedDate).toBe(initialDate);
				expect(result.current.jump).toBeNull();
			});
		});

		describe('goToNext', () => {
			it('jumps ahead 1 month in month view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'month' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-07-15');
				expect(result.current.jump?.date.toISODate()).toBe('2024-07-15');
			});

			it('jumps ahead 7 days in week view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'week' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate.toISODate()).toBe('2024-06-22');
			});

			it('does nothing in list view', () => {
				const initialDate = DateTime.local(2024, 6, 15);

				const { result } = renderHook(() => useTestContext(), {
					wrapper: createTestWrapper({ initialDate, initialView: 'list' }),
				});

				act(() => {
					result.current.goToNext();
				});

				expect(result.current.selectedDate).toBe(initialDate);
				expect(result.current.jump).toBeNull();
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

		it('keeps the selected date and records no jump when the view changes', () => {
			const initialDate = DateTime.local(2020, 1, 1);

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({ initialDate, initialView: 'month' }),
			});

			act(() => {
				result.current.setViewType('week');
			});

			expect(result.current.selectedDate).toBe(initialDate);
			expect(result.current.jump).toBeNull();
		});
	});

	describe('setSelectedDate', () => {
		it('selects the date without recording a jump', () => {
			const newDate = DateTime.local(2024, 8, 25);

			const { result } = renderHook(() => useTestContext(), {
				wrapper: createTestWrapper({
					initialDate: DateTime.local(2024, 6, 15),
				}),
			});

			act(() => {
				result.current.setSelectedDate(newDate);
			});

			expect(result.current.selectedDate).toBe(newDate);
			expect(result.current.jump).toBeNull();
		});
	});
});
