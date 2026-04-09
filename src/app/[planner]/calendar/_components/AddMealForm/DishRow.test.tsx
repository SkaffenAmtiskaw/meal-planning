import { Select } from '@mantine/core';

import { fireEvent, render, screen } from '@testing-library/react';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DishRow } from './DishRow';
import type { DishState } from './types';

import { usePlannerSavedItems } from '../../_hooks/usePlannerSavedItems';

vi.mock('@mantine/core', async () => await import('@mocks/@mantine/core'));

vi.mock('../../_hooks/usePlannerSavedItems', () => ({
	usePlannerSavedItems: vi.fn(),
}));

const usePlannerSavedItemsMock = vi.mocked(usePlannerSavedItems);
const SelectMock = vi.mocked(Select);

const makeDish = (overrides: Partial<DishState> = {}): DishState => ({
	id: 'dish-1',
	name: '',
	sourceType: 'none',
	savedId: '',
	sourceText: '',
	note: '',
	noteExpanded: false,
	...overrides,
});

const defaultProps = {
	index: 0,
	showRemove: false,
	onUpdate: vi.fn(),
	onRemove: vi.fn(),
};

describe('DishRow', () => {
	beforeEach(() => {
		usePlannerSavedItemsMock.mockReturnValue([]);
	});

	test('renders dish row with correct data-testid', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.getByTestId('dish-row-0')).toBeDefined();
	});

	test('renders dish name input with current dish name', () => {
		render(<DishRow dish={makeDish({ name: 'Soup' })} {...defaultProps} />);
		expect((screen.getByTestId('dish-name-0') as HTMLInputElement).value).toBe(
			'Soup',
		);
	});

	test('showRemove=false hides the remove button', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} showRemove={false} />);
		expect(screen.queryByTestId('dish-remove-0')).toBeNull();
	});

	test('showRemove=true shows the remove button', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} showRemove={true} />);
		expect(screen.getByTestId('dish-remove-0')).toBeDefined();
	});

	test('clicking remove calls onRemove', () => {
		const onRemove = vi.fn();
		render(
			<DishRow
				dish={makeDish()}
				{...defaultProps}
				showRemove={true}
				onRemove={onRemove}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-remove-0'));
		expect(onRemove).toHaveBeenCalledOnce();
	});

	test('source type defaults to none — no saved select or source text', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
		expect(screen.queryByTestId('dish-source-text-0')).toBeNull();
	});

	test('clicking saved segment calls onUpdate with sourceType saved', () => {
		const onUpdate = vi.fn();
		render(<DishRow dish={makeDish()} {...defaultProps} onUpdate={onUpdate} />);
		const control = screen.getByTestId('dish-source-type-0');
		fireEvent.click(control.querySelector('[data-value="saved"]') as Element);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'saved' });
	});

	test('clicking text segment calls onUpdate with sourceType text', () => {
		const onUpdate = vi.fn();
		render(<DishRow dish={makeDish()} {...defaultProps} onUpdate={onUpdate} />);
		const control = screen.getByTestId('dish-source-type-0');
		fireEvent.click(control.querySelector('[data-value="text"]') as Element);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'text' });
	});

	test('clicking none segment calls onUpdate with sourceType none', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ sourceType: 'saved' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		const control = screen.getByTestId('dish-source-type-0');
		fireEvent.click(control.querySelector('[data-value="none"]') as Element);
		expect(onUpdate).toHaveBeenCalledWith({ sourceType: 'none' });
	});

	test('sourceType saved renders saved select and hides source text', () => {
		render(
			<DishRow dish={makeDish({ sourceType: 'saved' })} {...defaultProps} />,
		);
		expect(screen.getByTestId('dish-saved-0')).toBeDefined();
		expect(screen.queryByTestId('dish-source-text-0')).toBeNull();
	});

	test('saved select receives data mapped from usePlannerSavedItems', () => {
		const savedItems = [
			{ _id: '1', name: 'Pasta', url: '/pasta' },
			{ _id: '2', name: 'Salad', url: '/salad' },
		];
		usePlannerSavedItemsMock.mockReturnValueOnce(savedItems);
		render(
			<DishRow dish={makeDish({ sourceType: 'saved' })} {...defaultProps} />,
		);
		expect(SelectMock).toHaveBeenCalledWith(
			expect.objectContaining({
				data: savedItems.map((item) => ({ value: item._id, label: item.name })),
			}),
			undefined,
		);
	});

	test('saved select onChange with value calls onUpdate with savedId', () => {
		const onUpdate = vi.fn();
		usePlannerSavedItemsMock.mockReturnValueOnce([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({ sourceType: 'saved' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		const onChange = SelectMock.mock.lastCall?.[0].onChange;
		onChange?.('1', { value: '1', label: 'Pasta' });
		expect(onUpdate).toHaveBeenCalledWith({ savedId: '1' });
	});

	test('saved select onChange with null calls onUpdate with empty savedId', () => {
		const onUpdate = vi.fn();
		usePlannerSavedItemsMock.mockReturnValueOnce([
			{ _id: '1', name: 'Pasta', url: '/pasta' },
		]);
		render(
			<DishRow
				dish={makeDish({ sourceType: 'saved', savedId: '1' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		const onChange = SelectMock.mock.lastCall?.[0].onChange;
		onChange?.(null, { value: '', label: '' });
		expect(onUpdate).toHaveBeenCalledWith({ savedId: '' });
	});

	test('sourceType text renders source text input and hides saved select', () => {
		render(
			<DishRow dish={makeDish({ sourceType: 'text' })} {...defaultProps} />,
		);
		expect(screen.getByTestId('dish-source-text-0')).toBeDefined();
		expect(screen.queryByTestId('dish-saved-0')).toBeNull();
	});

	test('typing in source text calls onUpdate with sourceText', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ sourceType: 'text' })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-source-text-0'), {
			target: { value: 'https://example.com' },
		});
		expect(onUpdate).toHaveBeenCalledWith({
			sourceText: 'https://example.com',
		});
	});

	test('note textarea is absent when noteExpanded is false', () => {
		render(<DishRow dish={makeDish()} {...defaultProps} />);
		expect(screen.queryByTestId('dish-note-0')).toBeNull();
	});

	test('clicking note toggle when noteExpanded false calls onUpdate with noteExpanded true', () => {
		const onUpdate = vi.fn();
		render(<DishRow dish={makeDish()} {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		expect(onUpdate).toHaveBeenCalledWith({ noteExpanded: true });
	});

	test('clicking note toggle when noteExpanded true calls onUpdate with noteExpanded false and clears note', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ noteExpanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.click(screen.getByTestId('dish-note-toggle-0'));
		expect(onUpdate).toHaveBeenCalledWith({ noteExpanded: false, note: '' });
	});

	test('note textarea is present when noteExpanded is true', () => {
		render(
			<DishRow dish={makeDish({ noteExpanded: true })} {...defaultProps} />,
		);
		expect(screen.getByTestId('dish-note-0')).toBeDefined();
	});

	test('typing in note calls onUpdate with note value', () => {
		const onUpdate = vi.fn();
		render(
			<DishRow
				dish={makeDish({ noteExpanded: true })}
				{...defaultProps}
				onUpdate={onUpdate}
			/>,
		);
		fireEvent.change(screen.getByTestId('dish-note-0'), {
			target: { value: 'A note' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ note: 'A note' });
	});

	test('changing dish name calls onUpdate with name value', () => {
		const onUpdate = vi.fn();
		render(<DishRow dish={makeDish()} {...defaultProps} onUpdate={onUpdate} />);
		fireEvent.change(screen.getByTestId('dish-name-0'), {
			target: { value: 'Pasta' },
		});
		expect(onUpdate).toHaveBeenCalledWith({ name: 'Pasta' });
	});
});
