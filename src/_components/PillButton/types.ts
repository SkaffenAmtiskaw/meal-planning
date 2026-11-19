import type { ButtonHTMLAttributes } from 'react';

export type PillButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: 'outline' | 'dashed';
	size?: 'sm' | 'md';
};
