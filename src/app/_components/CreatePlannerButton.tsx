'use client';

import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { CreatePlannerForm } from './CreatePlannerForm';

export const CreatePlannerButton = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<Button
				variant="cta"
				onClick={open}
				data-testid="no-planners-create-button"
			>
				Create Planner
			</Button>
			<CreatePlannerForm opened={opened} onClose={close} />
		</>
	);
};
