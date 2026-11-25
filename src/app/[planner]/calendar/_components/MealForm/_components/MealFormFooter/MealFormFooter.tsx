'use client';

import { Button, Group, Text } from '@mantine/core';

import { SubmitButton } from '@/_components';
import { useIsMobile } from '@/_hooks';
import type { Status } from '@/_hooks/useFormFeedback';

import { formatDishCount } from '../../_utils/formatDishCount';

type Props = {
	dishCount: number;
	status: Status;
	countdown: number;
	canSubmit: boolean;
	onCancel: () => void;
};

/**
 * The dish count, Cancel and Add Meal. A phone's frame has Cancel in its top bar,
 * so on a phone the footer holds only Add Meal.
 */
export const MealFormFooter = ({
	dishCount,
	status,
	countdown,
	canSubmit,
	onCancel,
}: Props) => {
	const isMobile = useIsMobile();

	const submit = (
		<SubmitButton
			status={status}
			countdown={countdown}
			label="Add Meal"
			disabled={!canSubmit}
			fullWidth={isMobile}
		/>
	);

	if (isMobile) {
		return submit;
	}

	return (
		<Group justify="space-between">
			<Text size="sm" c="var(--text-muted)">
				{`${formatDishCount(dishCount)} on this meal`}
			</Text>
			<Group gap="xs">
				<Button variant="subtle" onClick={onCancel}>
					Cancel
				</Button>
				{submit}
			</Group>
		</Group>
	);
};
