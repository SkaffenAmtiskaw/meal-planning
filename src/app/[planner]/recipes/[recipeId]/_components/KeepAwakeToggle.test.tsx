import { fireEvent, render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { KeepAwakeToggle } from './KeepAwakeToggle';

const mockRequest = vi.fn();
const mockRelease = vi.fn();
const mockUseWakeLock = vi.fn();

vi.mock('react-screen-wake-lock', () => ({
	useWakeLock: (opts: unknown) => mockUseWakeLock(opts),
}));

vi.mock('@mantine/core', () => ({
	Switch: ({
		checked,
		label,
		onChange,
		'data-testid': testId,
	}: {
		checked: boolean;
		label: string;
		onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
		'data-testid'?: string;
	}) => (
		<label>
			{label}
			<input
				type="checkbox"
				data-testid={testId}
				checked={checked}
				onChange={onChange}
			/>
		</label>
	),
}));

afterEach(() => {
	vi.resetAllMocks();
});

describe('KeepAwakeToggle', () => {
	test('renders nothing when wake lock is not supported', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: false,
			released: undefined,
			request: mockRequest,
			release: mockRelease,
		});
		const { container } = render(<KeepAwakeToggle />);
		expect(container.firstChild).toBeNull();
	});

	test('renders the switch when wake lock is supported', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: undefined,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		expect(screen.getByTestId('keep-awake-toggle')).toBeDefined();
		expect(screen.getByText('Keep screen awake')).toBeDefined();
	});

	test('passes reacquireOnPageVisible option to useWakeLock', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: undefined,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		expect(mockUseWakeLock).toHaveBeenCalledWith({
			reacquireOnPageVisible: true,
		});
	});

	test('switch is unchecked when released is undefined', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: undefined,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		const checkbox = screen.getByTestId(
			'keep-awake-toggle',
		) as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
	});

	test('switch is unchecked when released is true', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: true,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		const checkbox = screen.getByTestId(
			'keep-awake-toggle',
		) as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
	});

	test('switch is checked when released is false', () => {
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: false,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		const checkbox = screen.getByTestId(
			'keep-awake-toggle',
		) as HTMLInputElement;
		expect(checkbox.checked).toBe(true);
	});

	test('calls request when toggled on', () => {
		mockRequest.mockResolvedValue(undefined);
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: true,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		fireEvent.click(screen.getByTestId('keep-awake-toggle'));
		expect(mockRequest).toHaveBeenCalledWith('screen');
	});

	test('calls release when toggled off', () => {
		mockRelease.mockResolvedValue(undefined);
		mockUseWakeLock.mockReturnValue({
			isSupported: true,
			released: false,
			request: mockRequest,
			release: mockRelease,
		});
		render(<KeepAwakeToggle />);
		fireEvent.click(screen.getByTestId('keep-awake-toggle'));
		expect(mockRelease).toHaveBeenCalled();
	});
});
