'use client';

import Link from 'next/link';

import { createTheme, NavLink } from '@mantine/core';

export const theme = createTheme({
	components: {
		NavLink: NavLink.extend({
			defaultProps: {
				component: Link,
			},
		}),
	},
});
