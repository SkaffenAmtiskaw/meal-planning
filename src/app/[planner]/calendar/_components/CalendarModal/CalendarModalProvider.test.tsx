import type { ReactNode } from 'react';

import { Modal } from '@mantine/core';

import { act, render, renderHook, screen } from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { useCalendarModal } from './CalendarModalContext';
import { CalendarModalProvider } from './CalendarModalProvider';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));
vi.mock('../AddMealForm/AddMealModal', () => ({
	AddMealModal: vi.fn(() => <div data-testid="add-meal-modal" />),
}));

const mockUseIsMobile = vi.mocked(useIsMobile);
const mockModalRoot = vi.mocked(Modal.Root);

describe('CalendarModalProvider', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		mockUseIsMobile.mockReturnValue(false);
	});

	const wrapper = ({ children }: { children: ReactNode }) => (
		<CalendarModalProvider plannerId="planner-123">
			{children}
		</CalendarModalProvider>
	);

	it('renders its children', () => {
		render(
			<CalendarModalProvider plannerId="planner-123">
				<div data-testid="child">Child</div>
			</CalendarModalProvider>,
		);

		expect(screen.getByTestId('child')).toBeDefined();
	});

	it('renders Modal.Root/Overlay/Content when a modal is open', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(screen.getByTestId('modal-root')).toBeDefined();
		expect(screen.getByTestId('modal-overlay')).toBeDefined();
		expect(screen.getByTestId('add-meal-modal')).toBeDefined();
	});

	it('does not render modal content when no modal is open', () => {
		render(
			<CalendarModalProvider plannerId="planner-123">
				<div data-testid="child">Child</div>
			</CalendarModalProvider>,
		);

		expect(screen.queryByTestId('modal-root')).toBeNull();
	});

	it('returns null from modal content mapping when no modal type is active', () => {
		vi.mocked(Modal.Root).mockImplementation(({ children }) => (
			<div data-testid="modal-root">{children}</div>
		));

		render(
			<CalendarModalProvider plannerId="planner-123">
				<div data-testid="child">Child</div>
			</CalendarModalProvider>,
		);

		expect(screen.getByTestId('modal-root')).toBeDefined();
		expect(screen.queryByTestId('add-meal-modal')).toBeNull();
	});

	it('opens the modal when open is called with a modal type', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(mockModalRoot).toHaveBeenCalledWith(
			expect.objectContaining({
				opened: true,
				onClose: expect.any(Function),
				size: 'xl',
				fullScreen: false,
			}),
			undefined,
		);
	});

	it('renders the modal full screen on mobile', () => {
		mockUseIsMobile.mockReturnValue(true);

		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(mockModalRoot).toHaveBeenCalledWith(
			expect.objectContaining({
				opened: true,
				size: 'xl',
				fullScreen: true,
				radius: 0,
				transitionProps: { transition: 'fade', duration: 200 },
			}),
			undefined,
		);
	});

	it('closes the modal when close is called', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(screen.queryByTestId('modal-root')).toBeDefined();

		act(() => {
			result.current.close();
		});

		expect(screen.queryByTestId('modal-root')).toBeNull();
	});
});
