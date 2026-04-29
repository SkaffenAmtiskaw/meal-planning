import type { ReactNode } from 'react';

import { Stack } from '@mantine/core';

export interface AuthLayoutFooterProps {
	children: ReactNode;
}

export const AuthLayoutFooter: React.FC<AuthLayoutFooterProps> = ({
	children,
}) => {
	return (
		<Stack align="center" gap="xs">
			{children}
		</Stack>
	);
};
