import { describe, expect, test } from 'vitest';

import { catchify } from './catchify';

describe('catchify', () => {
	test('it should return an array with the value if the callback is successful', async () => {
		const test = () =>
			new Promise((resolve) => setTimeout(() => resolve('foo'), 100));

		expect(await catchify(test)).toEqual(['foo']);
	});

	test('it should return an array with the error if the callback is unsuccessful', async () => {
		const test = () =>
			new Promise((_resolve, reject) =>
				setTimeout(() => reject(new Error('boom')), 100),
			);

		expect(await catchify(test)).toEqual([undefined, new Error('boom')]);
	});
});
