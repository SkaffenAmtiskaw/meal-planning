import { notFound } from 'next/navigation';

import { Container } from '@mantine/core';

import { z } from 'zod';

import { getPlanner } from '@/_actions';
import { matchesId, zObjectId } from '@/_models';
import type { BookmarkInterface } from '@/_models/planner/bookmark.types';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import type { TagInterface } from '@/_models/planner/tag.types';

import { RecipeForm } from '../_components/Modal/RecipeForm';
import { RecipeDetail } from './_components/RecipeDetail';

const zParams = z.object({
	planner: zObjectId,
	recipeId: zObjectId,
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

	const item = planner.saved.find(matchesId(recipeId));

	if (!item || !!(item as unknown as BookmarkInterface).url) {
		notFound();
	}

	const recipe = JSON.parse(JSON.stringify(item)) as RecipeInterface;

	const tags = planner.tags.map((t) => ({
		_id: String(t._id),
		name: t.name,
		color: t.color,
	}));

	if (status === 'edit') {
		return (
			<Container size="md" py={16}>
				<RecipeForm
					item={recipe}
					plannerId={String(plannerId)}
					redirectTo={`/${String(plannerId)}/recipes/${String(recipeId)}`}
					tags={tags}
				/>
			</Container>
		);
	}

	return (
		<RecipeDetail
			plannerId={String(plannerId)}
			recipe={recipe}
			tags={tags as unknown as TagInterface[]}
		/>
	);
};

export default RecipePage;
