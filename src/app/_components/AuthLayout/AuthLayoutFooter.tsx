import type { ReactNode } from 'react';

import { Stack } from '@mantine/core';

interface AuthLayoutFooterProps {
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
