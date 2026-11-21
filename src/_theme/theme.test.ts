import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';

import { theme } from './theme';

describe('theme', () => {
	it('has navy as primary color', () => {
		expect(theme.primaryColor).toBe('navy');
	});

	it('colors the selected SegmentedControl option with the primary color', () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const defaultProps = theme.components?.SegmentedControl?.defaultProps;

		expect(
			typeof defaultProps === 'function' ? defaultProps(merged) : defaultProps,
		).toEqual({ color: 'navy' });
	});

	describe('Indicator', () => {
		const merged = mergeMantineTheme(DEFAULT_THEME, theme);
		const vars = theme.components?.Indicator?.vars;

		it('draws the white variant white with a number in the primary color', () => {
			expect(vars?.(merged, { variant: 'white' }, {})).toEqual({
				root: {
					'--indicator-color': merged.white,
					'--indicator-text-color': 'var(--mantine-color-navy-filled)',
				},
			});
		});

		it("draws the white variant's number in the Indicator's color when it has one", () => {
			expect(vars?.(merged, { variant: 'white', color: 'ember' }, {})).toEqual({
				root: {
					'--indicator-color': merged.white,
					'--indicator-text-color': 'var(--mantine-color-ember-filled)',
				},
			});
		});

		it("leaves other variants to Mantine's colors", () => {
			expect(vars?.(merged, {}, {})).toEqual({ root: {} });
		});
	});

	it('has ember, forest, and navy in color ramps', () => {
		expect(theme.colors).toHaveProperty('ember');
		expect(theme.colors).toHaveProperty('forest');
		expect(theme.colors).toHaveProperty('navy');
		const ember = theme.colors?.ember as unknown as readonly string[];
		const forest = theme.colors?.forest as unknown as readonly string[];
		const navy = theme.colors?.navy as unknown as readonly string[];
		expect(ember.length).toBe(10);
		expect(forest.length).toBe(10);
		expect(navy.length).toBe(10);
	});

	it('has component overrides configured', () => {
		expect(theme.components).toBeDefined();
		expect(theme.components).toHaveProperty('AppShell');
		expect(theme.components).toHaveProperty('Button');
	});

	it('has default radius set to md', () => {
		expect(theme.defaultRadius).toBe('md');
	});
});
