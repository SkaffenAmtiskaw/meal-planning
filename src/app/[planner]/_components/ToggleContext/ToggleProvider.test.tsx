import { useContext } from 'react';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { ToggleContext } from './ToggleContext';
import { ToggleProvider } from './ToggleProvider';

const mockUseDisclosure = vi.fn();
vi.mock('@mantine/hooks', () => ({
	useDisclosure: () => mockUseDisclosure(),
}));

describe('ToggleProvider', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders children', () => {
		mockUseDisclosure.mockReturnValue([false, { toggle: vi.fn() }]);

		render(
			<ToggleProvider>
				<div data-testid="child">Child Content</div>
			</ToggleProvider>,
		);

		expect(screen.getByTestId('child')).toBeDefined();
	});

	test('provides opened state and toggle function via context', () => {
		const mockToggle = vi.fn();
		mockUseDisclosure.mockReturnValue([true, { toggle: mockToggle }]);

		let contextValue: { opened: boolean; toggle: () => void } | null = null;
		const ContextReader = () => {
			contextValue = useContext(ToggleContext);
			return null;
		};

		render(
			<ToggleProvider>
				<ContextReader />
			</ToggleProvider>,
		);

		expect(contextValue).toEqual({ opened: true, toggle: mockToggle });
	});

	test('provides closed state when useDisclosure returns false', () => {
		const mockToggle = vi.fn();
		mockUseDisclosure.mockReturnValue([false, { toggle: mockToggle }]);

		let contextValue: { opened: boolean; toggle: () => void } | null = null;
		const ContextReader = () => {
			contextValue = useContext(ToggleContext);
			return null;
		};

		render(
			<ToggleProvider>
				<ContextReader />
			</ToggleProvider>,
		);

		expect(contextValue).not.toBeNull();
		// biome-ignore lint/style/noNonNullAssertion: The previous assertion ensures it is not null.
		expect(contextValue!.opened).toBe(false);
	});
});
