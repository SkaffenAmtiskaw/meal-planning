import { render } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { CalendarModalContext, useCalendarModal } from './CalendarModalContext';
import type { CalendarModalContextValue } from './CalendarModalContext';

describe('useCalendarModal', () => {
	it('throws when used outside provider', () => {
		const TestComponent = () => {
			useCalendarModal();
			return null;
		};

		expect(() => render(<TestComponent />)).toThrow(
			'useCalendarModal must be used within a CalendarModalProvider',
		);
	});

	it('returns context value when inside provider', () => {
		const mockValue: CalendarModalContextValue = {
			state: { type: null, data: null },
			open: vi.fn(),
			close: vi.fn(),
		};

		let capturedValue: CalendarModalContextValue | null = null;

		const TestComponent = () => {
			capturedValue = useCalendarModal();
			return null;
		};

		render(
			<CalendarModalContext.Provider value={mockValue}>
				<TestComponent />
			</CalendarModalContext.Provider>,
		);

		expect(capturedValue).toBe(mockValue);
	});
});
