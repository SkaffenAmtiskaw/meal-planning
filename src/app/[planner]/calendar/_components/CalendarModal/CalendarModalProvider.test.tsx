import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useCalendarModal } from './CalendarModalContext';
import { CalendarModalProvider } from './CalendarModalProvider';

const renderModalState = () =>
	renderHook(() => useCalendarModal(), { wrapper: CalendarModalProvider })
		.result;

describe('CalendarModalProvider', () => {
	it('starts with no modal open', () => {
		const result = renderModalState();

		expect(result.current.state).toEqual({ type: null, data: null });
	});

	it('holds the type and data a modal opened with', () => {
		const result = renderModalState();

		act(() => {
			result.current.open('add_meal', { initialDate: '2024-01-15' });
		});

		expect(result.current.state).toEqual({
			type: 'add_meal',
			data: { initialDate: '2024-01-15' },
		});
	});

	it('closes the open modal', () => {
		const result = renderModalState();
		act(() => {
			result.current.open('add_meal', {});
		});

		act(() => {
			result.current.close();
		});

		expect(result.current.state).toEqual({ type: null, data: null });
	});
});
