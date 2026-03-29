'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
	Anchor,
	Badge,
	Button,
	Container,
	Group,
	isLightColor,
	List,
	ListItem,
	SimpleGrid,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from '@mantine/core';

import { deleteRecipe } from '@/_actions/saved';
import type { RecipeInterface } from '@/_models/planner/recipe.types';
import type { TagInterface } from '@/_models/planner/tag.types';

import { DeleteConfirmModal } from '../../_components/DeleteConfirmModal';
import { KeepAwakeToggle } from './KeepAwakeToggle';

type Props = {
	plannerId: string;
	recipe: RecipeInterface;
	tags: TagInterface[];
};

export const RecipeDetail = ({ plannerId, recipe, tags }: Props) => {
	const theme = useMantineTheme();
	const router = useRouter();
	const [modalOpened, setModalOpened] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleDelete = async () => {
		setDeleting(true);
		await deleteRecipe({ plannerId, recipeId: String(recipe._id) });
		router.push(`/${plannerId}/recipes`);
	};

	const recipeTags = (recipe.tags ?? [])
		.map((id) => tags.find((t) => String(t._id) === String(id)))
		.filter((t): t is TagInterface => t !== undefined);

	const getPillStyle = (color: string) => {
		const bg = theme.colors[color]?.[5] ?? color;
		return { backgroundColor: bg, color: isLightColor(bg) ? '#000' : '#fff' };
	};

	return (
		<>
			<Container data-testid="recipe-detail" size="md" py={16}>
				<Stack gap="md">
					<Group justify="space-between" align="flex-start">
						<Title order={2}>{recipe.name}</Title>
						<Group align="center" gap="sm">
							<KeepAwakeToggle />
							<Button data-testid="edit-button" disabled variant="default">
								Edit
							</Button>
							<Button
								color="red"
								data-testid="delete-button"
								onClick={() => setModalOpened(true)}
							>
								Delete
							</Button>
						</Group>
					</Group>

					{recipe.source && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Source
							</Text>
							<SimpleGrid cols={{ base: 1, sm: 2 }}>
								<Stack gap={2}>
									<Text size="xs" c="dimmed">
										Name
									</Text>
									<Text data-testid="source-name">{recipe.source.name}</Text>
								</Stack>
								{recipe.source.url && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed">
											URL
										</Text>
										<Anchor
											data-testid="source-link"
											href={recipe.source.url}
											rel="noopener noreferrer"
											target="_blank"
										>
											{recipe.source.url}
										</Anchor>
									</Stack>
								)}
							</SimpleGrid>
						</Stack>
					)}

					{recipe.time && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Time
							</Text>
							<SimpleGrid cols={{ base: 2, sm: 4 }}>
								{recipe.time.prep && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed">
											Prep
										</Text>
										<Text data-testid="time-prep">{recipe.time.prep}</Text>
									</Stack>
								)}
								{recipe.time.cook && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed">
											Cook
										</Text>
										<Text data-testid="time-cook">{recipe.time.cook}</Text>
									</Stack>
								)}
								{recipe.time.total && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed">
											Total
										</Text>
										<Text data-testid="time-total">{recipe.time.total}</Text>
									</Stack>
								)}
								{recipe.time.actual && (
									<Stack gap={2}>
										<Text size="xs" c="dimmed">
											Actual
										</Text>
										<Text data-testid="time-actual">{recipe.time.actual}</Text>
									</Stack>
								)}
							</SimpleGrid>
						</Stack>
					)}

					{recipe.servings !== undefined && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Servings
							</Text>
							<Text data-testid="servings">{recipe.servings}</Text>
						</Stack>
					)}

					{recipe.ingredients.length > 0 && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Ingredients
							</Text>
							<List data-testid="ingredients-list">
								{recipe.ingredients.map((ingredient, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: ingredients are ordered positional items with no stable id
									<ListItem key={i}>{ingredient}</ListItem>
								))}
							</List>
						</Stack>
					)}

					{recipe.instructions.length > 0 && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Instructions
							</Text>
							<List data-testid="instructions-list" type="ordered">
								{recipe.instructions.map((instruction, i) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: instructions are ordered positional items with no stable id
									<ListItem key={i}>{instruction}</ListItem>
								))}
							</List>
						</Stack>
					)}

					{recipe.notes && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Notes
							</Text>
							<Text data-testid="notes">{recipe.notes}</Text>
						</Stack>
					)}

					{recipe.storage && (
						<Stack gap={4}>
							<Text fw={600} size="sm">
								Storage
							</Text>
							<Text data-testid="storage">{recipe.storage}</Text>
						</Stack>
					)}

					{recipeTags.length > 0 && (
						<Group gap="xs" data-testid="tags">
							{recipeTags.map((tag) => (
								<Badge key={String(tag._id)} style={getPillStyle(tag.color)}>
									{tag.name}
								</Badge>
							))}
						</Group>
					)}
				</Stack>
			</Container>
			<DeleteConfirmModal
				loading={deleting}
				onClose={() => setModalOpened(false)}
				onConfirm={handleDelete}
				opened={modalOpened}
			/>
		</>
	);
};
