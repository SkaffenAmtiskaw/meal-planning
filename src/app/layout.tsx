import { Inter, Roboto } from 'next/font/google';
import type { ReactNode } from 'react';

import { MantineProvider, mantineHtmlProps } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';

import clsx from 'clsx';

import { cssVariablesResolver, theme } from '@/_theme';
import { WEEK_START } from '@/_utils/weekStart';

import { OneTapSignInWrapper } from './_hooks/useOneTap/OneTapSignInWrapper';
import { SaveTimeZoneWrapper } from './_hooks/useSaveTimeZone';

import '@mantine/core/styles.css';
// Mantine requires the dates styles to load after the core styles.
import '@mantine/dates/styles.css';

const inter = Inter({
	subsets: ['latin'],
	weight: ['400', '500', '600'],
});

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['500'],
	variable: '--font-roboto',
});

export const metadata = {
	title: 'Meal Planner',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<link rel="shortcut icon" href="/favicon.svg" />
				<meta
					name="viewport"
					content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
				/>
			</head>
			<body
				className={clsx(inter.className, roboto.variable)}
				style={{ height: '100vh' }}
			>
				<MantineProvider
					defaultColorScheme="light"
					theme={theme}
					cssVariablesResolver={cssVariablesResolver}
				>
					<DatesProvider
						settings={{ firstDayOfWeek: WEEK_START, consistentWeeks: true }}
					>
						<SaveTimeZoneWrapper>
							<OneTapSignInWrapper>{children}</OneTapSignInWrapper>
						</SaveTimeZoneWrapper>
					</DatesProvider>
				</MantineProvider>
			</body>
		</html>
	);
}
