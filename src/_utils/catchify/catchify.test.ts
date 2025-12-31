import { describe, expect, test } from 'vitest';

import { catchify } from './catchify';

describe('catchify', () => {
	test('it should return an array with the value if the callback is successful', () => {
		const test = () => 'foo';

		expect(catchify(test)).toEqual(['foo']);
	});

	test('it should return an array with the error if the callback is unsuccessful', () => {
		const test = () => {
			throw new Error('boom');
		};

		expect(catchify(test)).toEqual([undefined, new Error('boom')]);
	});
});
