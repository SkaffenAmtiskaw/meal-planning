import { render, screen } from '@testing-library/react';

import { describe, expect, test, vi } from 'vitest';

import RootLayout, { metadata } from './layout';

vi.mock('@mantine/core/styles.css', () => ({}));

vi.mock('@mantine/core', () => ({
	ColorSchemeScript: () => null,
	MantineProvider: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	mantineHtmlProps: {},
}));

vi.mock('@/_components', () => ({
	OneTapSignInWrapper: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock('@/_theme', () => ({
	theme: {},
}));

describe('root layout', () => {
	test('has correct page title in metadata', () => {
		expect(metadata.title).toBe('Meal Planer');
	});

	test('renders children', () => {
		render(<RootLayout>{"Ursula's Kitchen"}</RootLayout>);

		expect(screen.getByText("Ursula's Kitchen")).toBeDefined();
	});
});
