import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isPastDate, isWithinHours, toLocaleDateString } from './date';

describe('date utilities', () => {
	describe('toLocaleDateString', () => {
		it('should format a valid date string to a readable format', () => {
			const result = toLocaleDateString('2024-01-15T12:00:00.000Z');
			// Result varies by timezone, so we verify structure
			expect(result).toMatch(/[A-Za-z]+ \d{1,2}, \d{4}/);
			expect(result).toContain('2024');
		});

		it('should format dates with year, month, and day', () => {
			const result = toLocaleDateString('2024-06-15T00:00:00.000Z');
			expect(result).toMatch(/[A-Za-z]+ \d{1,2}, 2024/);
		});

		it('should handle ISO date strings', () => {
			const result = toLocaleDateString('2024-03-20T12:30:45.123Z');
			expect(result).toMatch(/[A-Za-z]+ \d{1,2}, \d{4}/);
		});
	});

	describe('isWithinHours', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return true when date is within default 24 hours', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const in12Hours = '2024-01-16T00:00:00.000Z';
			expect(isWithinHours(in12Hours)).toBe(true);
		});

		it('should return false when date is more than 24 hours away', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const in48Hours = '2024-01-17T12:00:00.000Z';
			expect(isWithinHours(in48Hours)).toBe(false);
		});

		it('should return false when date is already in the past', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const past = '2024-01-15T10:00:00.000Z';
			expect(isWithinHours(past)).toBe(false);
		});

		it('should return true when exactly at the threshold', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const in24Hours = '2024-01-16T12:00:00.000Z';
			expect(isWithinHours(in24Hours)).toBe(true);
		});

		it('should respect custom hours threshold', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const in12Hours = '2024-01-16T00:00:00.000Z';
			expect(isWithinHours(in12Hours, 48)).toBe(true);
			expect(isWithinHours(in12Hours, 6)).toBe(false);
		});

		it('should handle fractional hours correctly', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const in30Minutes = '2024-01-15T12:30:00.000Z';
			expect(isWithinHours(in30Minutes)).toBe(true);
		});
	});

	describe('isPastDate', () => {
		beforeEach(() => {
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return true when date is in the past', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const yesterday = '2024-01-14T12:00:00.000Z';
			expect(isPastDate(yesterday)).toBe(true);
		});

		it('should return false when date is in the future', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const tomorrow = '2024-01-16T12:00:00.000Z';
			expect(isPastDate(tomorrow)).toBe(false);
		});

		it('should return false when date is exactly now', () => {
			const now = new Date('2024-01-15T12:00:00.000Z');
			vi.setSystemTime(now);

			const rightNow = '2024-01-15T12:00:00.000Z';
			expect(isPastDate(rightNow)).toBe(false);
		});
	});
});
