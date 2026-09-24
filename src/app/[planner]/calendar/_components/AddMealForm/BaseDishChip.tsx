'use client';

import type { ReactNode } from 'react';

import { UnstyledButton } from '@mantine/core';

import classes from './BaseDishChip.module.css';

type BaseDishChipProps = {
	children: ReactNode;
	isEmpty: boolean;
	onClick: () => void;
	'data-testid': string;
	className?: string;
	title?: string;
};

export const BaseDishChip = ({
	children,
	isEmpty,
	onClick,
	'data-testid': testId,
	className,
	title,
}: BaseDishChipProps) => {
	return (
		<UnstyledButton
			type="button"
			onClick={onClick}
			data-testid={testId}
			title={title}
			className={`${classes.root} ${isEmpty ? classes.empty : classes.set} ${className ?? ''}`}
		>
			{children}
		</UnstyledButton>
	);
};
