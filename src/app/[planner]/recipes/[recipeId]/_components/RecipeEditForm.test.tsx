import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { useRouter } from 'next/navigation';

import type { RecipeInterface } from '@/_models/types';

import { RecipeEditForm } from './RecipeEditForm';

import { RecipeForm } from '../../_components/Modal/RecipeForm';

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('../../_components/Modal/RecipeForm', () => ({
	RecipeForm: vi.fn(() => null),
}));

const recipe = {
	_id: '507f1f77bcf86cd799439012',
	name: "Maleficent's Dragon Roast",
	ingredients: [],
	instructions: [],
} as unknown as RecipeInterface;

describe('RecipeEditForm', () => {
	const mockPush = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test.each([
		'onCancel',
		'onSuccess',
	] as const)("goes back to the recipe's page when the form's %s is called", (callback) => {
		render(
			<RecipeEditForm
				plannerId="507f1f77bcf86cd799439011"
				recipe={recipe}
				tags={[]}
			/>,
		);

		const [[props]] = vi.mocked(RecipeForm).mock.calls;
		props[callback]();
		expect(mockPush).toHaveBeenCalledWith(
			'/507f1f77bcf86cd799439011/recipes/507f1f77bcf86cd799439012',
		);
	});
});
