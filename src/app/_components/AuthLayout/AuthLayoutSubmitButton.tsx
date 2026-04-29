import type { ReactNode } from 'react';

import { Button } from '@mantine/core';

export interface AuthLayoutSubmitButtonProps {
	children: ReactNode;
	loading?: boolean;
	onClick?: () => void;
	type?: 'button' | 'submit';
	'data-testid'?: string;
}

export const AuthLayoutSubmitButton: React.FC<AuthLayoutSubmitButtonProps> = ({
	children,
	loading,
	onClick,
	type = 'submit',
	'data-testid': testId,
}) => {
	return (
		<Button
			type={type}
			variant="cta"
			loading={loading}
			onClick={onClick}
			data-testid={testId}
			fullWidth
		>
			{children}
		</Button>
	);
};
