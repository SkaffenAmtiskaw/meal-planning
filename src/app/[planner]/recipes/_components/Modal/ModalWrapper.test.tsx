import { render } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { usePathname, useRouter } from 'next/navigation';

import { Modal } from '@mantine/core';

import type { BookmarkInterface, RecipeInterface } from '@/_models/types';

import { ModalWrapper } from './ModalWrapper';

vi.mock('next/navigation', async () => await import('#mocks/next/navigation'));

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

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
		render(<ModalWrapper {...props}>content</ModalWrapper>);

		const [[modalProps]] = vi.mocked(Modal).mock.calls;
		expect(modalProps).toEqual(
			expect.objectContaining({ opened: true, size, title }),
		);
	});

	test('navigates to pathname when Modal onClose is called', () => {
		render(
			<ModalWrapper status="add" type="recipe">
				content
			</ModalWrapper>,
		);
		const call = vi.mocked(Modal).mock.calls[0][0];
		call.onClose?.();
		expect(mockPush).toHaveBeenCalledWith('/jafar-planner/recipes');
	});
});
