import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePathname, useRouter } from 'next/navigation';

import { Modal } from '@mantine/core';

import type { BookmarkInterface, RecipeInterface } from '@/_models/types';

import { BookmarkForm } from './BookmarkForm';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('./BookmarkForm', () => ({
	BookmarkForm: vi.fn(() => null),
}));

vi.mock('./RecipeForm', () => ({
	RecipeForm: vi.fn(() => null),
}));

const bookmark = {
	_id: '507f1f77bcf86cd799439012',
	name: "Gaston's Golden Goose",
	url: 'https://example.com',
	tags: [],
} as unknown as BookmarkInterface;

const recipe = {
	_id: '507f1f77bcf86cd799439013',
	name: "Ursula's Sea Bisque",
	ingredients: [],
	instructions: [],
} as unknown as RecipeInterface;

const formProps = {
	plannerId: 'jafar-planner',
	tags: [{ _id: 'tag-1', name: 'Spicy', color: 'red' }],
};

describe('modal wrapper', () => {
	const mockPush = vi.fn();

	beforeAll(() => {
		const defaultRouter = vi.mocked(useRouter)();
		vi.mocked(useRouter).mockReturnValue({
			...defaultRouter,
			push: mockPush,
		});
		vi.mocked(usePathname).mockReturnValue('/jafar-planner/recipes');
	});

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test.each([
		{
			name: 'add bookmark',
			props: { status: 'add', type: 'bookmark' },
			size: 'md',
			title: 'Add New Bookmark',
		},
		{
			name: 'add recipe',
			props: { status: 'add', type: 'recipe' },
			size: 'xl',
			title: 'Add New Recipe',
		},
		{
			name: 'edit bookmark',
			props: { status: 'edit', type: 'bookmark', item: bookmark },
			size: 'md',
			title: "Update Gaston's Golden Goose",
		},
		{
			name: 'edit recipe',
			props: { status: 'edit', type: 'recipe', item: recipe },
			size: 'xl',
			title: "Update Ursula's Sea Bisque",
		},
	] as const)('sets the $name modal title and size', ({
		props,
		size,
		title,
	}) => {
		render(<ModalWrapper {...props} {...formProps} />);

		const [[modalProps]] = vi.mocked(Modal).mock.calls;
		expect(modalProps).toEqual(
			expect.objectContaining({ opened: true, size, title }),
		);
	});

	test.each([
		{
			name: 'add bookmark',
			props: { status: 'add', type: 'bookmark' },
			form: BookmarkForm,
			other: RecipeForm,
			item: undefined,
		},
		{
			name: 'add recipe',
			props: { status: 'add', type: 'recipe' },
			form: RecipeForm,
			other: BookmarkForm,
			item: undefined,
		},
		{
			name: 'edit bookmark',
			props: { status: 'edit', type: 'bookmark', item: bookmark },
			form: BookmarkForm,
			other: RecipeForm,
			item: bookmark,
		},
		{
			name: 'edit recipe',
			props: { status: 'edit', type: 'recipe', item: recipe },
			form: RecipeForm,
			other: BookmarkForm,
			item: recipe,
		},
	] as const)('renders the $name form with its item', ({
		props,
		form,
		other,
		item,
	}) => {
		render(<ModalWrapper {...props} {...formProps} />);

		const [[renderedProps]] = vi.mocked(form).mock.calls;
		expect(renderedProps).toEqual(
			expect.objectContaining({ ...formProps, item }),
		);
		expect(other).not.toHaveBeenCalled();
	});

	test('navigates to pathname when Modal onClose is called', () => {
		render(<ModalWrapper status="add" type="recipe" {...formProps} />);
		const call = vi.mocked(Modal).mock.calls[0][0];
		call.onClose?.();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});

	test.each([
		'onCancel',
		'onSuccess',
	] as const)("navigates to pathname when the form's %s is called", (callback) => {
		render(<ModalWrapper status="add" type="recipe" {...formProps} />);
		const [[props]] = vi.mocked(RecipeForm).mock.calls;
		props[callback]();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});
});
