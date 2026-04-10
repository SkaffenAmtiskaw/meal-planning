import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test, vi } from 'vitest';

import RootLayout, { metadata } from './layout';

vi.mock('@mantine/core/styles.css', () => ({}));

vi.mock('next/font/google', () => ({
	Inter: () => ({ className: 'inter-class' }),
}));

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

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
		expect(metadata.title).toBe('Meal Planner');
	});

	test('renders children', () => {
		const html = renderToStaticMarkup(
			<RootLayout>{"Ursula's Kitchen"}</RootLayout>,
		);

		expect(html).toContain('Ursula&#x27;s Kitchen');
	});
});
