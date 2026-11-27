import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { makeDishValues } from '#fixtures/dish';

import { DishProvider } from './DishProvider';
import { useDish } from './useDish';

import {
	isNamelessDish,
	useMealFormContext,
} from '../../../_hooks/useMealForm';

vi.mock(
	'../../../_hooks/useMealForm',
	async () =>
		await import(
			'#mocks/@app/[planner]/calendar/_components/_hooks/useMealForm'
		),
);

const garlic = makeDishValues({ key: 'garlic', note: 'double the garlic' });

// A form holding these errors, as a stopped save leaves them.
const withErrors = (errors: Record<string, string>) => {
	const form = useMealFormContext();
	vi.mocked(useMealFormContext).mockReturnValue({ ...form, errors });
};

const renderDish = (index = 1) =>
	renderHook(() => useDish(), {
		wrapper: ({ children }: { children: ReactNode }) => (
			<DishProvider dish={garlic} index={index}>
				{children}
			</DishProvider>
		),
	}).result.current;

describe('useDish', () => {
	beforeEach(() => {
		vi.mocked(isNamelessDish).mockReturnValue(true);
		withErrors({});
	});

	it('gives the dish and its place that its provider holds', () => {
		const dish = renderDish(1);

		expect(dish.dish).toBe(garlic);
		expect(dish.index).toBe(1);
	});

	it("gives the message a stopped save left on the dish's name", () => {
		withErrors({ 'dishes.1.name': 'Name this dish, or delete it.' });

		expect(renderDish(1).nameError).toBe('Name this dish, or delete it.');
	});

	it("gives no message from another dish's name", () => {
		withErrors({ 'dishes.0.name': 'Name this dish, or delete it.' });

		expect(renderDish(1).nameError).toBeNull();
	});

	it('hides the message once the dish has a name, so clearing the name brings it back', () => {
		withErrors({ 'dishes.1.name': 'Name this dish, or delete it.' });
		vi.mocked(isNamelessDish).mockReturnValue(false);

		expect(renderDish(1).nameError).toBeNull();
		expect(isNamelessDish).toHaveBeenCalledWith(garlic);
	});

	it('throws outside DishProvider', () => {
		expect(() => renderHook(() => useDish())).toThrow(
			'useDish must be used inside DishProvider',
		);
	});
});
