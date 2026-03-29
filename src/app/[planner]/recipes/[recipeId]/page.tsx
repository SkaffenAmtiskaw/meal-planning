import { notFound } from 'next/navigation';

import { z } from 'zod';

import { getPlanner } from '@/_actions';
import { matchesId, zObjectId } from '@/_models';
import type { BookmarkInterface } from '@/_models/planner/bookmark.types';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import type { TagInterface } from '@/_models/planner/tag.types';

import { RecipeDetail } from './_components/RecipeDetail';

const zParams = z.object({
	planner: zObjectId,
	recipeId: zObjectId,
});

const RecipePage = async ({
	params,
}: PageProps<'/[planner]/recipes/[recipeId]'>) => {
	const { planner: plannerId, recipeId } = zParams.parse(await params);

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
	})) as unknown as TagInterface[];

	return (
		<RecipeDetail plannerId={String(plannerId)} recipe={recipe} tags={tags} />
	);
};

export default RecipePage;
