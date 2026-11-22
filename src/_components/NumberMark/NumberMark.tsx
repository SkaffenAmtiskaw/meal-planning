import type { AriaAttributes, ReactNode } from 'react';

import { type MantineSize, Text } from '@mantine/core';

import ringClasses from '@/_theme/ring.module.css';

import classes from './NumberMark.module.css';

interface NumberMarkProps extends AriaAttributes {
	children: ReactNode;
	ring?: boolean;
	filled?: boolean;
	muted?: boolean;
	size?: MantineSize;
}

export function NumberMark({
	children,
	ring = false,
	filled = false,
	muted = false,
	size = 'sm',
	...ariaProps
}: NumberMarkProps) {
	const className = [
		classes.mark,
		ring && ringClasses.ring,
		filled && classes.filled,
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Text
			span
			size={size}
			fw={ring || filled ? 700 : undefined}
			c={muted ? 'navy.3' : 'navy.5'}
			className={className}
			{...ariaProps}
		>
			{children}
		</Text>
	);
}
