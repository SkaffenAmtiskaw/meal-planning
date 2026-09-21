import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { Modal } from '@mantine/core';

import {
	act,
	fireEvent,
	render,
	renderHook,
	screen,
} from '@testing-library/react';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useIsMobile } from '@/_hooks';

import { useCalendarModal } from './CalendarModalContext';
import { CalendarModalProvider } from './CalendarModalProvider';

import { AddMealForm } from '../AddMealForm/AddMealForm';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));
vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));
vi.mock('next/navigation', async () => await import('@mocks/next/navigation'));
vi.mock('@/_hooks', async () => await import('@mocks/@/_hooks'));
vi.mock('../AddMealForm/AddMealForm', () => ({
	AddMealForm: vi.fn(({ onCancel, onSuccess }) => (
		<div data-testid="add-meal-form">
			<button data-testid="cancel-button" onClick={onCancel}>
				Cancel
			</button>
			<button data-testid="success-button" onClick={() => onSuccess?.()}>
				Success
			</button>
		</div>
	)),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockUseIsMobile = vi.mocked(useIsMobile);

describe('CalendarModalProvider', () => {
	beforeEach(() => {
		vi.resetAllMocks();
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

	it('does not render modal content when no modal is open', () => {
		vi.mocked(Modal).mockImplementation(({ children, opened }) => (
			<div role="dialog" data-opened={String(opened)}>
				{children}
			</div>
		));

		render(
			<CalendarModalProvider plannerId="planner-123">
				<div data-testid="child">Child</div>
			</CalendarModalProvider>,
		);

		const dialog = screen.getByRole('dialog');
		expect(dialog.getAttribute('data-opened')).toBe('false');
		expect(dialog.children.length).toBe(0);
	});

	it('opens the modal when open is called with a modal type', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(vi.mocked(Modal)).toHaveBeenCalledWith(
			expect.objectContaining({
				opened: true,
				onClose: expect.any(Function),
				title: 'Add Meal',
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

		expect(vi.mocked(Modal)).toHaveBeenCalledWith(
			expect.objectContaining({
				opened: true,
				title: 'Add Meal',
				size: 'xl',
				fullScreen: true,
				radius: 0,
				transitionProps: { transition: 'fade', duration: 200 },
			}),
			undefined,
		);
	});

	it('passes initialDate to AddMealForm when open is called with add_meal data', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', { initialDate: '2024-01-15' });
		});

		expect(vi.mocked(AddMealForm)).toHaveBeenCalledWith(
			expect.objectContaining({
				plannerId: 'planner-123',
				initialDate: '2024-01-15',
			}),
			undefined,
		);
	});

	it('closes the modal when close is called', () => {
		const { result } = renderHook(() => useCalendarModal(), { wrapper });

		act(() => {
			result.current.open('add_meal', {});
		});

		expect(screen.queryByRole('dialog')).toBeDefined();

		act(() => {
			result.current.close();
		});

		expect(screen.queryByRole('dialog')).toBeNull();
	});

	it('closes the modal and calls router.refresh when AddMealForm onSuccess is triggered', () => {
		const refresh = vi.fn();
		mockUseRouter.mockReturnValue({
			push: vi.fn(),
			replace: vi.fn(),
			refresh,
			back: vi.fn(),
			forward: vi.fn(),
			prefetch: vi.fn(),
		});

		const TestOpener = () => {
			const { open } = useCalendarModal();

			useEffect(() => {
				open('add_meal', {});
			}, [open]);

			return null;
		};

		render(
			<CalendarModalProvider plannerId="planner-123">
				<TestOpener />
			</CalendarModalProvider>,
		);

		fireEvent.click(screen.getByTestId('success-button'));

		expect(refresh).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('dialog')).toBeNull();
	});
});
