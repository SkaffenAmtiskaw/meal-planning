import { Stack, Text, Title } from '@mantine/core';

import { getPlanners } from '@/_actions/planner';

export const PlannerList = async () => {
	const planners = await getPlanners();

	return (
		<Stack>
			<Title order={3}>Your Planners</Title>
			{planners.map((planner) => (
				<Text key={String(planner._id)}>{planner.name}</Text>
			))}
		</Stack>
	);
};
