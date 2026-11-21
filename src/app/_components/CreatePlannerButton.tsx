'use client';

import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { CreatePlannerModal } from './CreatePlannerModal';

export const CreatePlannerButton = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<Button variant="cta" onClick={open}>
				Create Planner
			</Button>
			<CreatePlannerModal opened={opened} onClose={close} />
		</>
	);
};
