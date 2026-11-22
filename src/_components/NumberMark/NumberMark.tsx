import type { AriaAttributes, ReactNode } from 'react';

import { type MantineSize, Text } from '@mantine/core';

import ringClasses from '@/_theme/ring.module.css';

import classes from './NumberMark.module.css';

interface NumberMarkProps extends AriaAttributes {
	children: ReactNode;
	ring?: boolean;
	muted?: boolean;
	size?: MantineSize;
}

export function NumberMark({
	children,
	ring = false,
	muted = false,
	size = 'sm',
	...ariaProps
}: NumberMarkProps) {
	return (
		<Text
			span
			size={size}
			fw={ring ? 700 : undefined}
			c={muted ? 'navy.3' : 'navy.5'}
			className={ring ? `${classes.mark} ${ringClasses.ring}` : classes.mark}
			{...ariaProps}
		>
			{children}
		</Text>
	);
}
