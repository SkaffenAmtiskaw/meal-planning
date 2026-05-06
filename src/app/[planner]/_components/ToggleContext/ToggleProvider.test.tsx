import { useContext } from 'react';

import { useDisclosure } from '@mantine/hooks';

import { render, screen } from '@testing-library/react';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToggleContext } from './ToggleContext';
import { ToggleProvider } from './ToggleProvider';

vi.mock('@mantine/hooks', async () => await import('@mocks/@mantine/hooks'));

describe('ToggleProvider', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders children', () => {
		render(
			<ToggleProvider>
				<div data-testid="child">Child Content</div>
			</ToggleProvider>,
		);

		expect(screen.getByTestId('child')).toBeDefined();
	});

	it('provides opened state and toggle function via context', () => {
		const mockToggle = vi.fn();
		vi.mocked(useDisclosure).mockReturnValueOnce([
			true,
			{ open: vi.fn(), close: vi.fn(), toggle: mockToggle, set: vi.fn() },
		]);

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
});
