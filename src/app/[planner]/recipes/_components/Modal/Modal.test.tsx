import { render } from '@testing-library/react';

import { Types } from 'mongoose';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Modal } from './Modal';

const mockGetSavedItem = vi.fn();
vi.mock('@/_actions', () => ({
	getSavedItem: (...args: unknown[]) => mockGetSavedItem(...args),
}));

const mockModalWrapper = vi.fn(
	({ children, title }: { children: React.ReactNode; title: string }) => (
		<div data-testid="modal-wrapper" data-title={title}>
			{children}
		</div>
	),
);
vi.mock('./ModalWrapper', () => ({
	ModalWrapper: (props: {
		children: React.ReactNode;
		title: string;
		opened: boolean;
	}) => mockModalWrapper(props),
}));

vi.mock('./BookmarkForm', () => ({
	BookmarkForm: () => <div data-testid="bookmark-form" />,
}));

vi.mock('./RecipeForm', () => ({
	RecipeForm: () => <div data-testid="recipe-form" />,
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

describe('modal', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders nothing when status is not provided', async () => {
		const { container } = render(await Modal({ planner: makePlanner() }));
		expect(container.firstChild).toBeNull();
	});

	test('renders nothing when type is not provided', async () => {
		const { container } = render(
			await Modal({ planner: makePlanner(), status: 'add' }),
		);
		expect(container.firstChild).toBeNull();
	});

	test('renders nothing for edit status with an unrecognized type', async () => {
		const itemId = new Types.ObjectId();
		mockGetSavedItem.mockResolvedValue({ name: 'Scar Steak' });

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

	test('renders nothing for edit status without an item id', async () => {
		const { container } = render(
			await Modal({ planner: makePlanner(), status: 'edit', type: 'bookmark' }),
		);
		expect(container.firstChild).toBeNull();
	});

	test('renders nothing when the edit item is not found', async () => {
		mockGetSavedItem.mockResolvedValue(null);

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

	test('renders add bookmark modal with correct title', async () => {
		render(
			await Modal({ planner: makePlanner(), status: 'add', type: 'bookmark' }),
		);

		expect(mockModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Add New Bookmark' }),
		);
	});

	test('renders add recipe modal with correct title', async () => {
		render(
			await Modal({ planner: makePlanner(), status: 'add', type: 'recipe' }),
		);

		expect(mockModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Add New Recipe' }),
		);
	});

	test('serializes planner tags when rendering recipe modal', async () => {
		const tagId = new Types.ObjectId();
		const plannerWithTags = makePlanner([
			{ _id: tagId, name: 'Spicy', color: 'red' },
		]);

		render(
			await Modal({ planner: plannerWithTags, status: 'add', type: 'recipe' }),
		);

		expect(mockModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Add New Recipe' }),
		);
	});

	test('renders edit bookmark modal with item name in title', async () => {
		const itemId = new Types.ObjectId();
		mockGetSavedItem.mockResolvedValue({
			_id: itemId,
			name: "Gaston's Golden Goose",
			url: 'https://example.com',
			tags: [],
		});

		render(
			await Modal({
				planner: makePlanner(),
				status: 'edit',
				type: 'bookmark',
				item: itemId,
			}),
		);

		expect(mockModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Update Gaston's Golden Goose" }),
		);
	});

	test('renders edit recipe modal with item name in title', async () => {
		const itemId = new Types.ObjectId();
		mockGetSavedItem.mockResolvedValue({
			_id: itemId,
			name: "Ursula's Sea Bisque",
			ingredients: [],
			instructions: [],
		});

		render(
			await Modal({
				planner: makePlanner(),
				status: 'edit',
				type: 'recipe',
				item: itemId,
			}),
		);

		expect(mockModalWrapper).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Update Ursula's Sea Bisque" }),
		);
	});
});
