import { describe, expect, it } from 'vitest';

import { DateTime } from 'luxon';

import { makeIsKnown } from './makeIsKnown';
import { possibleDaysAround } from './possibleDaysAround';

describe('makeIsKnown', () => {
	it('knows every period once there is one possible day, even the last of a month', () => {
		const isKnown = makeIsKnown([DateTime.local(2026, 11, 30)]);

		expect([isKnown('day'), isKnown('week'), isKnown('month')]).toEqual([
			true,
			true,
			true,
		]);
	});

	it('never knows the day while there are several possible days', () => {
		const isKnown = makeIsKnown(
			possibleDaysAround(DateTime.local(2026, 11, 18)),
		);

		expect(isKnown('day')).toBe(false);
	});

	describe('month', () => {
		it('is known when every possible day is in one month', () => {
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 15)),
			);

			expect(isKnown('month')).toBe(true);
		});

		it('is unknown when the UTC day is the first of its month', () => {
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 1)),
			);

			expect(isKnown('month')).toBe(false);
		});

		it('is unknown when the UTC day is the last of its month', () => {
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 30)),
			);

			expect(isKnown('month')).toBe(false);
		});
	});

	describe('week', () => {
		it('is known when every possible day is in one week', () => {
			// Wednesday 2026-11-18, in the week that starts on Sunday 2026-11-15.
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 18)),
			);

			expect(isKnown('week')).toBe(true);
		});

		it('is unknown when the UTC day is the first of its week', () => {
			// Sunday 2026-11-15.
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 15)),
			);

			expect(isKnown('week')).toBe(false);
		});

		it('is unknown when the UTC day is the last of its week', () => {
			// Saturday 2026-11-21.
			const isKnown = makeIsKnown(
				possibleDaysAround(DateTime.local(2026, 11, 21)),
			);

			expect(isKnown('week')).toBe(false);
		});
	});
});
