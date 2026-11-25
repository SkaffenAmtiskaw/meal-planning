import { redirect } from 'next/navigation';

import { Container, Group } from '@mantine/core';

import { z } from 'zod';

import { checkAuth } from '@/_actions/auth/checkAuth';
import { getPlanner } from '@/_actions/planner/getPlanner';
import { zId } from '@/_utils/zId';

import { AddItemDropdown, Modal, SavedList } from './_components';

const zParams = z.object({
	planner: zId,
});

const zSearchParams = z.object({
	item: zId.optional(),
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

	// The add and edit forms need write access, so anyone else gets the plain list.
	if (status && (await checkAuth(id, 'write')).type !== 'authorized') {
		return redirect(`/${id}/recipes`);
	}

	return (
		<>
			<Modal item={item} planner={planner} status={status} type={type} />
			<Container py={8}>
				<Group justify="flex-end">
					<AddItemDropdown />
				</Group>
				<SavedList items={planner.saved} plannerId={id} tags={planner.tags} />
			</Container>
		</>
	);
};

export default RecipesPage;
