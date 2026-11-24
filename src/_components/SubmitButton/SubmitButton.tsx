'use client';

import { Button } from '@mantine/core';

import type { Status } from '@/_hooks/useFormFeedback';

interface Props {
	status: Status;
	countdown: number;
	label: string;
	// Holds the button back while the form can't be sent yet, such as with a required field empty.
	disabled?: boolean;
	fullWidth?: boolean;
}

export const SubmitButton = ({
	status,
	countdown,
	label,
	disabled = false,
	fullWidth,
}: Props) => {
	if (status === 'submitting') {
		return (
			<Button
				type="submit"
				variant="cta"
				fullWidth={fullWidth}
				loading
				disabled
			>
				{label}
			</Button>
		);
	}

	if (status === 'success') {
		return (
			<Button type="button" color="green" fullWidth={fullWidth}>
				{`Saved! Closing in ${countdown}…`}
			</Button>
		);
	}

	return (
		<Button
			type="submit"
			variant="cta"
			fullWidth={fullWidth}
			disabled={disabled}
		>
			{label}
		</Button>
	);
};
