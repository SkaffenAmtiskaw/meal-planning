import { describe, expect, test, vi } from 'vitest';

import { userAgent } from 'next/server';

import { renderToStaticMarkup } from 'react-dom/server';

import { MobileGuessProvider } from '@/_hooks';

import RootLayout, { metadata } from './layout';

vi.mock('next/font/google', () => ({
	Inter: () => ({ className: 'mock-inter-class' }),
	Roboto: () => ({
		className: 'mock-roboto-class',
		variable: 'mock-roboto-variable',
	}),
}));

vi.mock('next/headers', async () => await import('#mocks/next/headers'));

vi.mock('next/server', () => ({
	userAgent: vi.fn(() => ({ device: {} })),
}));

vi.mock('@mantine/core/styles.css', () => ({}));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));

vi.mock('./_hooks/useOneTap/OneTapSignInWrapper', () => ({
	OneTapSignInWrapper: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock('./_hooks/useSaveTimeZone/SaveTimeZoneWrapper', () => ({
	SaveTimeZoneWrapper: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
}));

vi.mock('@/_theme', () => ({
	theme: {},
	cssVariablesResolver: vi.fn(),
}));

const guessFor = async (deviceType: string | undefined) => {
	vi.mocked(userAgent).mockReturnValueOnce({
		device: { type: deviceType },
	} as ReturnType<typeof userAgent>);

	renderToStaticMarkup(await RootLayout({ children: null }));

	return vi.mocked(MobileGuessProvider).mock.lastCall?.[0].isMobile;
};

describe('root layout', () => {
	test('has correct page title in metadata', () => {
		expect(metadata.title).toBe('Meal Planner');
	});

	test('renders children', async () => {
		const html = renderToStaticMarkup(
			await RootLayout({ children: "Ursula's Kitchen" }),
		);

		expect(html).toContain('Ursula&#x27;s Kitchen');
	});

	test('guesses a phone from a mobile user agent', async () => {
		expect(await guessFor('mobile')).toBe(true);
	});

	test('guesses desktop for a tablet', async () => {
		expect(await guessFor('tablet')).toBe(false);
	});

	test('guesses desktop for a desktop browser', async () => {
		expect(await guessFor(undefined)).toBe(false);
	});
});
