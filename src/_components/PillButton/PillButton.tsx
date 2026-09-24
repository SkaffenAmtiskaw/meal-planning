import { type ButtonHTMLAttributes, forwardRef } from 'react';

import { UnstyledButton } from '@mantine/core';

import classes from './PillButton.module.css';

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'outline' | 'dashed';
	size?: 'sm' | 'md';
};

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(
	({ children, variant = 'outline', size = 'sm', className, ...rest }, ref) => {
		return (
			<UnstyledButton
				ref={ref}
				className={`${classes.root} ${classes[size]} ${classes[variant]} ${className ?? ''}`}
				{...rest}
			>
				{children}
			</UnstyledButton>
		);
	},
);

PillButton.displayName = 'PillButton';
