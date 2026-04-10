"use client";

import { Button } from "@mantine/core";

type Status = "idle" | "submitting" | "success" | "error";

interface Props {
	status: Status;
	countdown: number;
	label: string;
}

export const SubmitButton = ({ status, countdown, label }: Props) => {
	if (status === "submitting") {
		return (
			<Button type="submit" color="ember" loading disabled>
				{label}
			</Button>
		);
	}

	if (status === "success") {
		return (
			<Button type="button" color="green">
				{`Saved! Closing in ${countdown}…`}
			</Button>
		);
	}

	return (
		<Button type="submit" color="ember">
			{label}
		</Button>
	);
};
