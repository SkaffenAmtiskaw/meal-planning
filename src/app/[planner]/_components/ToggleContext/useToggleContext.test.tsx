import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import { ToggleProvider } from './ToggleProvider';
import { useToggleContext } from './useToggleContext';

const mockUseDisclosure = vi.fn();
vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => mockUseDisclosure(),
}));

describe('useToggleContext', () => {
	test('throws error when used outside ToggleProvider', () => {
		mockUseDisclosure.mockReturnValue([false, { toggle: vi.fn() }]);

		const TestComponent = () => {
			useToggleContext();
			return null;
		};

		expect(() => render(<TestComponent />)).toThrow(
			'useToggleContext must be used within ToggleProvider',
		);
	});

	test('returns toggle function that can be called', () => {
		const mockToggle = vi.fn();
		mockUseDisclosure.mockReturnValue([false, { toggle: mockToggle }]);

		const TestComponent = () => {
			const { toggle } = useToggleContext();
			return (
				<button data-testid="toggle-btn" type="button" onClick={toggle}>
					Toggle
				</button>
			);
		};

		render(
			<ToggleProvider>
				<TestComponent />
			</ToggleProvider>,
		);

		const btn = screen.getByTestId('toggle-btn');
		btn.click();

		expect(mockToggle).toHaveBeenCalledTimes(1);
	});
});
