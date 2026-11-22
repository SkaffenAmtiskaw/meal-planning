import type { AriaAttributes, ReactNode } from 'react';

import { type MantineSize, Text } from '@mantine/core';

import clsx from 'clsx';

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
	return (
		<Text
			span
			size={size}
			fw={ring || filled ? 700 : undefined}
			c={muted ? 'navy.3' : 'navy.5'}
			className={clsx(
				classes.mark,
				ring && classes.ring,
				filled && classes.filled,
			)}
			{...ariaProps}
		>
			{children}
		</Text>
	);
}
