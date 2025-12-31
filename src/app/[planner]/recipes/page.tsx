import { ActionIcon, Affix } from '@mantine/core';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models';

const RecipesPage = async ({ params }: PageProps<'/[planner]/recipes'>) => {
	const { planner: id } = await params;

	const authorized = await checkAuth(id);

	// TODO: Maybe error handling might be preferable
	if (!authorized) throw new Error('fuck off');

	const planner = await Planner.findById(id);

	// TODO: Error handling is magical.
	if (!planner) return null;

	return (
		<>
			<Affix bottom={20} right={20}>
				<ActionIcon size="xl"></ActionIcon>
			</Affix>
		</>
	);
};

export default RecipesPage;
