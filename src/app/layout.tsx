import { Inter } from 'next/font/google';
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
			<body className={inter.className} style={{ height: '100vh' }}>
				<MantineProvider defaultColorScheme="auto" theme={theme}>
					<OneTapSignInWrapper>{children}</OneTapSignInWrapper>
				</MantineProvider>
			</body>
		</html>
	);
}
