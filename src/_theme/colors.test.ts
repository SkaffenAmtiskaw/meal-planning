import { describe, expect, it } from 'vitest';

import {
	EMBER_RAMPS,
	getMealColor,
	NAVY_RAMPS,
	TAG_COLOR_NAMES,
	TAG_COLORS,
	THEME_COLORS,
} from './colors';

describe('THEME_COLORS', () => {
	it('has navy, forest, sage, ember, chalk properties', () => {
		expect(THEME_COLORS).toHaveProperty('navy');
		expect(THEME_COLORS).toHaveProperty('forest');
		expect(THEME_COLORS).toHaveProperty('sage');
		expect(THEME_COLORS).toHaveProperty('ember');
		expect(THEME_COLORS).toHaveProperty('chalk');
	});

	it('all values are valid hex colors', () => {
		for (const value of Object.values(THEME_COLORS)) {
			expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

describe('EMBER_RAMPS', () => {
	it('is an array of 10 hex values', () => {
		expect(EMBER_RAMPS).toHaveLength(10);
		for (const value of EMBER_RAMPS) {
			expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

describe('NAVY_RAMPS', () => {
	it('is an array of 10 hex values', () => {
		expect(NAVY_RAMPS).toHaveLength(10);
		for (const value of NAVY_RAMPS) {
			expect(value).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

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

describe('TAG_COLOR_NAMES', () => {
	it('is exported and is an array', () => {
		expect(Array.isArray(TAG_COLOR_NAMES)).toBe(true);
	});

	it('contains exactly 10 entries', () => {
		expect(TAG_COLOR_NAMES).toHaveLength(10);
	});

	it('each entry is a key of TAG_COLORS', () => {
		const tagColorKeys = Object.keys(TAG_COLORS);
		for (const name of TAG_COLOR_NAMES) {
			expect(tagColorKeys).toContain(name);
		}
	});

	it('the first entry is tangerine and the last is slate', () => {
		expect(TAG_COLOR_NAMES[0]).toBe('tangerine');
		expect(TAG_COLOR_NAMES[9]).toBe('slate');
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
		expect(colors.size).toBeGreaterThanOrEqual(5);
	});
});
