'use client';

import { useRouter } from 'next/navigation';

import type { RecipeInterface } from '@/_models/types';

import { RecipeForm } from '../../_components/Modal/RecipeForm';
import type { TagOption } from '../../_components/types';

type Props = {
	plannerId: string;
	recipe: RecipeInterface;
	tags: TagOption[];
};

export const RecipeEditForm = ({ plannerId, recipe, tags }: Props) => {
	const router = useRouter();

	// Cancelling or saving goes back to the recipe's page.
	const backToRecipe = () => router.push(`/${plannerId}/recipes/${recipe._id}`);

	return (
		<RecipeForm
			item={recipe}
			plannerId={plannerId}
			tags={tags}
			onCancel={backToRecipe}
			onSuccess={backToRecipe}
		/>
	);
};
