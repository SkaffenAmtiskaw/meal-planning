/**
 * Shared mock for ../CalendarModal.
 *
 * Usage in a test file:
 *   vi.mock('../CalendarModal', async () =>
 *     await import('#mocks/@app/[planner]/calendar/_components/CalendarModal')
 *   );
 *
 * By default no modal is open, and `open` and `close` are fresh stubs. A test
 * that checks what's opened gives the hook its own `open`:
 *   vi.mocked(useCalendarModal).mockReturnValue({ ...value, open })
 *
 * The provider only renders its children, and `CalendarModals` renders nothing.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

import type { CalendarModalContextValue } from '@/app/[planner]/calendar/_components/CalendarModal';

export const useCalendarModal = vi.fn(
	(): CalendarModalContextValue => ({
		state: { type: null, data: null },
		open: vi.fn(),
		close: vi.fn(),
	}),
);

export const CalendarModalProvider = vi.fn(
	({ children }: { children: ReactNode }) => children,
);

export const CalendarModals = vi.fn((_props: { plannerId: string }) => null);
