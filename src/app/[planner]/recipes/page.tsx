import { Container, Group } from '@mantine/core';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth';
import { Planner, zObjectId } from '@/_models';

import { AddItemDropdown, Modal } from './_components';

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

	const authorized = await checkAuth(id);

	// TODO: Maybe error handling might be preferable
	if (!authorized) throw new Error('fuck off');

	const planner = await Planner.findById(id);

	// TODO: Error handling is magical.
	if (!planner) return null;

	return (
		<>
			<Modal item={item} planner={id} status={status} type={type} />
			<Container py={8}>
				<Group justify="flex-end">
					<AddItemDropdown />
				</Group>
				{planner.saved?.map((item) => (
					<div key={item._id.toString()}>{item.name}</div>
				))}
			</Container>
		</>
	);
};

export default RecipesPage;
