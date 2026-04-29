import type { ReactNode } from 'react';

import { Alert } from '@mantine/core';

export interface AuthLayoutAlertProps {
	children: ReactNode;
	color?: 'red' | 'green' | 'yellow';
	'data-testid'?: string;
}

export const AuthLayoutAlert: React.FC<AuthLayoutAlertProps> = ({
	children,
	color = 'red',
	'data-testid': testId,
}) => {
	return (
		<Alert color={color} data-testid={testId}>
			{children}
		</Alert>
	);
};
