import { Container, Group } from '@mantine/core';

import { checkAuth } from '@/_actions/auth';
import { Planner } from '@/_models';

import { AddItemDropdown, Modal, ModalContent } from './_components';

const RecipesPage = async ({
	params,
	searchParams,
}: PageProps<'/[planner]/recipes'>) => {
	const { planner: id } = await params;
	const { item, status, type } = await searchParams;

	const authorized = await checkAuth(id);

	// TODO: Maybe error handling might be preferable
	if (!authorized) throw new Error('fuck off');

	const planner = await Planner.findById(id);

	// TODO: Error handling is magical.
	if (!planner) return null;

	return (
		<>
			<Modal opened={!!status && !!type}>
				<ModalContent
					item={item as string | undefined}
					planner={id}
					status={status as string | undefined}
					type={type as string | undefined}
				/>
			</Modal>
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
