import { Group, Stack, Title } from '@mantine/core';

import { getPlanners } from '@/_actions/planner';

import { PlannerItem } from './PlannerItem';
import { PlannerListActions } from './PlannerListActions';

export const PlannerList = async () => {
	const planners = await getPlanners();

	return (
		<Stack>
			<Group justify="space-between" align="center">
				<Title order={3}>Your Planners</Title>
				<PlannerListActions />
			</Group>
			{planners.map(({ planner, accessLevel }) => (
				<PlannerItem
					key={planner._id}
					id={planner._id}
					name={planner.name}
					accessLevel={accessLevel}
				/>
			))}
		</Stack>
	);
};
