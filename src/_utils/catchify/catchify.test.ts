import { describe, expect, test } from 'vitest';

import { DynamicServerError } from 'next/dist/client/components/hooks-server-context';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { redirect } from 'next/navigation';

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

	test("it should rethrow Next's dynamic-usage error instead of returning it", async () => {
		const error = new DynamicServerError('used `headers`');

		await expect(catchify(() => Promise.reject(error))).rejects.toBe(error);
	});

	test("it should rethrow Next's redirect error instead of returning it", async () => {
		await expect(catchify(async () => redirect('/'))).rejects.toSatisfy(
			isRedirectError,
		);
	});
});
