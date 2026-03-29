'use client';

import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface Props {
	status: Status;
	errorMessage: string | undefined;
}

export const FormFeedbackAlert = ({ status, errorMessage }: Props) => {
	if (status !== 'error') {
		return null;
	}

	return (
		<Alert color="red" icon={<IconAlertCircle />}>
			{errorMessage}
		</Alert>
	);
};
