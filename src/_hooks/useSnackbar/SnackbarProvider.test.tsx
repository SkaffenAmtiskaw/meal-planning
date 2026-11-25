import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { SnackbarProvider } from './SnackbarProvider';
import { useSnackbar } from './useSnackbar';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const wrapper = ({ children }: { children: ReactNode }) => (
	<SnackbarProvider>{children}</SnackbarProvider>
);

const renderSnackbar = () =>
	renderHook(() => useSnackbar(), { wrapper }).result;

describe('SnackbarProvider', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows no bar until a message is shown', () => {
		renderSnackbar();

		expect(screen.getByRole('status').textContent).toBe('');
	});

	it('shows a message with no Undo for 4 seconds', () => {
		const result = renderSnackbar();

		act(() => result.current.show({ message: 'Added to Fri, Nov 27' }));

		expect(screen.getByRole('status').textContent).toBe('Added to Fri, Nov 27');
		expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull();

		act(() => vi.advanceTimersByTime(3999));
		expect(screen.queryByText('Added to Fri, Nov 27')).not.toBeNull();

		act(() => vi.advanceTimersByTime(1));
		expect(screen.queryByText('Added to Fri, Nov 27')).toBeNull();
	});

	it('shows a message with Undo for 6 seconds', () => {
		const result = renderSnackbar();

		act(() =>
			result.current.show({ message: 'Deleted Taco Night', onUndo: vi.fn() }),
		);

		act(() => vi.advanceTimersByTime(5999));
		expect(screen.queryByText('Deleted Taco Night')).not.toBeNull();

		act(() => vi.advanceTimersByTime(1));
		expect(screen.queryByText('Deleted Taco Night')).toBeNull();
	});

	it('runs Undo and hides the bar when Undo is clicked', () => {
		const onUndo = vi.fn();
		const result = renderSnackbar();
		act(() => result.current.show({ message: 'Deleted Taco Night', onUndo }));

		fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

		expect(onUndo).toHaveBeenCalledTimes(1);
		expect(screen.queryByText('Deleted Taco Night')).toBeNull();
	});

	it('replaces the message showing, and gives the new one its full time', () => {
		const result = renderSnackbar();
		act(() => result.current.show({ message: 'Moved to Mon, Nov 23' }));
		act(() => vi.advanceTimersByTime(3000));

		act(() => result.current.show({ message: 'Added to Fri, Nov 27' }));

		expect(screen.getByRole('status').textContent).toBe('Added to Fri, Nov 27');
		act(() => vi.advanceTimersByTime(3999));
		expect(screen.queryByText('Added to Fri, Nov 27')).not.toBeNull();
	});
});
