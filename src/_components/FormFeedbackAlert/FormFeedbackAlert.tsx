'use client';

import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import type { Status } from '@/_hooks/useFormFeedback';

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
