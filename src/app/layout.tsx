import { Inter, Roboto } from 'next/font/google';
import type { ReactNode } from 'react';

import { MantineProvider, mantineHtmlProps } from '@mantine/core';

import { OneTapSignInWrapper } from '@/_components';
import { theme } from '@/_theme';

import '@mantine/core/styles.css';
import '@schedule-x/theme-default/dist/index.css';
import 'temporal-polyfill/global';

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
				className={`${inter.className} ${roboto.variable}`}
				style={{ height: '100vh' }}
			>
				<MantineProvider defaultColorScheme="light" theme={theme}>
					<OneTapSignInWrapper>{children}</OneTapSignInWrapper>
				</MantineProvider>
			</body>
		</html>
	);
}
