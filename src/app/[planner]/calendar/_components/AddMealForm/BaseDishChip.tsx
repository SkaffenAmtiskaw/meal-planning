'use client';

import type { ReactNode } from 'react';

import { PillButton } from '@/_components/PillButton';

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
		<PillButton
			onClick={onClick}
			data-testid={testId}
			title={title}
			variant={isEmpty ? 'dashed' : 'outline'}
			size="sm"
			className={className}
		>
			{children}
		</PillButton>
	);
};
