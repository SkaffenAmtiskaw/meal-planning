import { describe, expect, it } from 'vitest';

import { getMealColor, TAG_COLORS } from './colors';

describe('TAG_COLORS', () => {
	it('has 10 tag colors', () => {
		expect(Object.keys(TAG_COLORS).length).toBe(10);
	});

	it('each tag has bg, text, and border properties', () => {
		for (const [, color] of Object.entries(TAG_COLORS)) {
			expect(color).toHaveProperty('bg');
			expect(color).toHaveProperty('text');
			expect(color).toHaveProperty('border');
			expect(color.bg).toMatch(/^#[0-9A-Fa-f]{6}$/);
			expect(color.text).toMatch(/^#[0-9A-Fa-f]{6}$/);
			expect(color.border).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

describe('getMealColor', () => {
	it('returns a valid tag color name', () => {
		const result = getMealColor('Spaghetti');
		const validColors = Object.keys(TAG_COLORS);
		expect(validColors).toContain(result);
	});

	it('returns consistent color for same meal name', () => {
		const color1 = getMealColor('Spaghetti');
		const color2 = getMealColor('Spaghetti');
		expect(color1).toBe(color2);
	});

	it('distributes colors across different meal names', () => {
		const colors = new Set([
			getMealColor('Pasta'),
			getMealColor('Salad'),
			getMealColor('Soup'),
			getMealColor('Steak'),
			getMealColor('Tacos'),
			getMealColor('Curry'),
			getMealColor('Pizza'),
			getMealColor('Sushi'),
			getMealColor('Burger'),
			getMealColor('Ramen'),
		]);
		expect(colors.size).toBeGreaterThan(1);
	});
});
