import { render } from '@testing-library/react';

import { Types } from 'mongoose';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSavedItem } from '@/_actions/library';

import { BookmarkForm } from './BookmarkForm';
import { Modal } from './Modal';
import { ModalWrapper } from './ModalWrapper';
import { RecipeForm } from './RecipeForm';

vi.mock(
	'@/_actions/library',
	async () => await import('@mocks/@/_actions/library'),
);

vi.mock('./BookmarkForm', async () => ({
	BookmarkForm: vi.fn(() => <div data-testid="bookmark-form" />),
}));

vi.mock('./ModalWrapper', async () => ({
	ModalWrapper: vi.fn(
		({ children, title }: { children: React.ReactNode; title: string }) => (
			<div data-testid="modal-wrapper" data-title={title}>
				{children}
			</div>
		),
	),
}));

vi.mock('./RecipeForm', async () => ({
	RecipeForm: vi.fn(() => <div data-testid="recipe-form" />),
}));

const makePlanner = (
	tags: { _id: Types.ObjectId; name: string; color: string }[] = [],
) =>
	({
		_id: new Types.ObjectId(),
		saved: [],
		calendar: [],
		tags,
	}) as unknown as Parameters<typeof Modal>[0]['planner'];

describe('Modal', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('returns null when status is not provided', async () => {
		const { container } = render(await Modal({ planner: makePlanner() }));
		expect(container.firstChild).toBeNull();
	});

	it('returns null when type is not provided', async () => {
		const { container } = render(
			await Modal({ planner: makePlanner(), status: 'add' }),
		);
		expect(container.firstChild).toBeNull();
	});

	it('returns null for edit status without an item id', async () => {
		const { container } = render(
			await Modal({ planner: makePlanner(), status: 'edit', type: 'bookmark' }),
		);
		expect(container.firstChild).toBeNull();
	});

	it('returns null for edit status with an unrecognized type', async () => {
		const itemId = new Types.ObjectId();

		const { container } = render(
			await Modal({
				planner: makePlanner(),
				status: 'edit',
				// biome-ignore lint/suspicious/noExplicitAny: exercising defensive branch not reachable via TypeScript types
				type: 'unknown' as any,
				item: itemId,
			}),
		);
		expect(container.firstChild).toBeNull();
	});

	it('returns null when the edit item is not found', async () => {
		vi.mocked(getSavedItem).mockResolvedValueOnce(null as never);

		const { container } = render(
			await Modal({
				planner: makePlanner(),
				status: 'edit',
				type: 'bookmark',
				item: new Types.ObjectId(),
			}),
		);
		expect(container.firstChild).toBeNull();
	});

	it('renders add bookmark modal with correct props', async () => {
		const planner = makePlanner();

		render(await Modal({ planner, status: 'add', type: 'bookmark' }));

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual(
			expect.objectContaining({
				opened: true,
				size: 'md',
				title: 'Add New Bookmark',
			}),
		);

		const [[bookmarkFormProps]] = vi.mocked(BookmarkForm).mock.calls;
		expect(bookmarkFormProps).toEqual(
			expect.objectContaining({
				plannerId: planner._id.toString(),
				tags: [],
			}),
		);
	});

	it('renders add recipe modal with correct props', async () => {
		const tagId = new Types.ObjectId();
		const planner = makePlanner([{ _id: tagId, name: 'Spicy', color: 'red' }]);

		render(await Modal({ planner, status: 'add', type: 'recipe' }));

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual(
			expect.objectContaining({
				opened: true,
				size: 'xl',
				title: 'Add New Recipe',
			}),
		);

		const [[recipeFormProps]] = vi.mocked(RecipeForm).mock.calls;
		expect(recipeFormProps).toEqual(
			expect.objectContaining({
				plannerId: planner._id.toString(),
				tags: [{ _id: tagId.toString(), name: 'Spicy', color: 'red' }],
			}),
		);
	});

	it('renders edit bookmark modal with correct props', async () => {
		const itemId = new Types.ObjectId();
		const planner = makePlanner();
		const bookmark = {
			_id: itemId,
			name: "Gaston's Golden Goose",
			url: 'https://example.com',
			tags: [],
		};
		vi.mocked(getSavedItem).mockResolvedValueOnce(bookmark as never);

		render(
			await Modal({
				planner,
				status: 'edit',
				type: 'bookmark',
				item: itemId,
			}),
		);

		expect(vi.mocked(getSavedItem)).toHaveBeenCalledWith(planner._id, itemId);

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual(
			expect.objectContaining({
				opened: true,
				title: "Update Gaston's Golden Goose",
			}),
		);

		const [[bookmarkFormProps]] = vi.mocked(BookmarkForm).mock.calls;
		expect(bookmarkFormProps).toEqual(
			expect.objectContaining({
				item: expect.objectContaining({ name: "Gaston's Golden Goose" }),
				plannerId: planner._id.toString(),
				tags: [],
			}),
		);
	});

	it('renders edit recipe modal with correct props', async () => {
		const itemId = new Types.ObjectId();
		const planner = makePlanner();
		const recipe = {
			_id: itemId,
			name: "Ursula's Sea Bisque",
			ingredients: [],
			instructions: [],
		};
		vi.mocked(getSavedItem).mockResolvedValueOnce(recipe as never);

		render(
			await Modal({
				planner,
				status: 'edit',
				type: 'recipe',
				item: itemId,
			}),
		);

		expect(vi.mocked(getSavedItem)).toHaveBeenCalledWith(planner._id, itemId);

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual(
			expect.objectContaining({
				opened: true,
				size: 'xl',
				title: "Update Ursula's Sea Bisque",
			}),
		);

		const [[recipeFormProps]] = vi.mocked(RecipeForm).mock.calls;
		expect(recipeFormProps).toEqual(
			expect.objectContaining({
				item: expect.objectContaining({ name: "Ursula's Sea Bisque" }),
				plannerId: planner._id.toString(),
				tags: [],
			}),
		);
	});
});
