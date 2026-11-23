import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getSavedItem } from '@/_actions/library/getSavedItem';

import { Modal } from './Modal';
import { ModalWrapper } from './ModalWrapper';

vi.mock(
	'@/_actions/library/getSavedItem',
	async () => await import('#mocks/@/_actions/library/getSavedItem'),
);

vi.mock('./ModalWrapper', async () => ({
	ModalWrapper: vi.fn(() => <div data-testid="modal-wrapper" />),
}));

const plannerId = '507f1f77bcf86cd799439011';
const itemId = '507f1f77bcf86cd799439012';

const makePlanner = (
	tags: { _id: string; name: string; color: string }[] = [],
) =>
	({
		_id: plannerId,
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

	it.each([
		'bookmark',
		'recipe',
	] as const)('opens the add %s modal with the planner', async (type) => {
		const tags = [
			{ _id: '507f1f77bcf86cd799439013', name: 'Spicy', color: 'red' },
		];
		const planner = makePlanner(tags);

		render(await Modal({ planner, status: 'add', type }));

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual({
			status: 'add',
			type,
			plannerId,
			tags,
		});
	});

	it.each([
		{
			type: 'bookmark',
			item: {
				_id: itemId,
				name: "Gaston's Golden Goose",
				url: 'https://example.com',
				tags: [],
			},
		},
		{
			type: 'recipe',
			item: {
				_id: itemId,
				name: "Ursula's Sea Bisque",
				ingredients: [],
				instructions: [],
			},
		},
	] as const)('opens the edit $type modal with the saved item', async ({
		type,
		item,
	}) => {
		const planner = makePlanner();
		vi.mocked(getSavedItem).mockResolvedValueOnce(item as never);

		render(await Modal({ planner, status: 'edit', type, item: itemId }));

		expect(vi.mocked(getSavedItem)).toHaveBeenCalledWith(plannerId, itemId);

		const [[modalWrapperProps]] = vi.mocked(ModalWrapper).mock.calls;
		expect(modalWrapperProps).toEqual({
			status: 'edit',
			type,
			item,
			plannerId,
			tags: [],
		});
	});

	it.each([
		{
			type: 'bookmark',
			item: {
				_id: itemId,
				name: "Ursula's Sea Bisque",
				ingredients: [],
				instructions: [],
			},
		},
		{
			type: 'recipe',
			item: {
				_id: itemId,
				name: "Gaston's Golden Goose",
				url: 'https://example.com',
				tags: [],
			},
		},
	] as const)('returns null when the edit $type id names the other kind of item', async ({
		type,
		item,
	}) => {
		vi.mocked(getSavedItem).mockResolvedValueOnce(item as never);

		const { container } = render(
			await Modal({
				planner: makePlanner(),
				status: 'edit',
				type,
				item: itemId,
			}),
		);
		expect(container.firstChild).toBeNull();
	});
});
