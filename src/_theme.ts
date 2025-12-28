'use client';

import { createTheme, NavLink } from '@mantine/core';
import Link from 'next/link';

export const theme = createTheme({
	components: {
		NavLink: NavLink.extend({
			defaultProps: {
				component: Link,
			},
		}),
	},
});
