import { notFound } from 'next/navigation';

import { Container } from '@mantine/core';

import { z } from 'zod';

import { getPlanner } from '@/_actions/planner/getPlanner';
import { zId } from '@/_utils/zId';

import { RecipeDetail } from './_components/RecipeDetail';
import { RecipeEditForm } from './_components/RecipeEditForm';

const zParams = z.object({
	planner: zId,
	recipeId: zId,
});

const zSearchParams = z.object({
	status: z.literal('edit').optional(),
});

const RecipePage = async ({
	params,
	searchParams,
}: PageProps<'/[planner]/recipes/[recipeId]'>) => {
	const { planner: plannerId, recipeId } = zParams.parse(await params);
	const { status } = zSearchParams.parse(await searchParams);

	const planner = await getPlanner(plannerId);

	const recipe = planner.saved.find((item) => item._id === recipeId);

	if (!recipe || 'url' in recipe) {
		return notFound();
	}

	if (status === 'edit') {
		return (
			<Container size="md" py={16}>
				<RecipeEditForm
					plannerId={plannerId}
					recipe={recipe}
					tags={planner.tags}
				/>
			</Container>
		);
	}

	return (
		<RecipeDetail plannerId={plannerId} recipe={recipe} tags={planner.tags} />
	);
};

export default RecipePage;
