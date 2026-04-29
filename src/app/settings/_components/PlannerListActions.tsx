'use client';

import { ActionIcon, Affix, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';

import { CreatePlannerForm } from './CreatePlannerForm';

export const PlannerListActions = () => {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<Button
				variant="cta"
				visibleFrom="sm"
				leftSection={<IconPlus size={16} />}
				onClick={open}
				data-testid="new-planner-button"
			>
				New Planner
			</Button>
			<Affix position={{ bottom: 20, right: 20 }} hiddenFrom="sm">
				<ActionIcon
					size="xl"
					radius="xl"
					onClick={open}
					data-testid="new-planner-fab"
					aria-label="New Planner"
				>
					<IconPlus />
				</ActionIcon>
			</Affix>
			<CreatePlannerForm opened={opened} onClose={close} />
		</>
	);
};
