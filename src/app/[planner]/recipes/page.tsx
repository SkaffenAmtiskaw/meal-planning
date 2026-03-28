import { Container, Group } from '@mantine/core';

import { z } from 'zod';

import { getPlanner } from '@/_actions';
import { zObjectId } from '@/_models';

import { AddItemDropdown, Modal, SavedList } from './_components';

const zParams = z.object({
	planner: zObjectId,
});

const zSearchParams = z.object({
	item: zObjectId.optional(),
	status: z.union([z.literal('add'), z.literal('edit')]).optional(),
	type: z.union([z.literal('bookmark'), z.literal('recipe')]).optional(),
});

const RecipesPage = async ({
	params,
	searchParams,
}: PageProps<'/[planner]/recipes'>) => {
	const { planner: id } = zParams.parse(await params);
	const { item, status, type } = zSearchParams.parse(await searchParams);

	const planner = await getPlanner(id);

	return (
		<>
			<Modal item={item} planner={planner} status={status} type={type} />
			<Container py={8}>
				<Group justify="flex-end">
					<AddItemDropdown />
				</Group>
				<SavedList items={planner.saved} plannerId={id} />
			</Container>
		</>
	);
};

export default RecipesPage;
