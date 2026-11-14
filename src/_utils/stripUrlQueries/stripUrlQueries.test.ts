import { describe, expect, it } from 'vitest';

import { stripUrlQueries } from './stripUrlQueries';

describe('stripUrlQueries', () => {
	it.each([
		[
			'https://app.example.com/invite?token=abc',
			'https://app.example.com/invite',
		],
		['https://app.example.com/?a=1&b=2', 'https://app.example.com/'],
		[
			'https://app.example.com/reset-password?',
			'https://app.example.com/reset-password',
		],
		[
			'https://app.example.com/page?token=abc#section',
			'https://app.example.com/page#section',
		],
		['https://app.example.com/invite', 'https://app.example.com/invite'],
	])('removes the query string from %s', (url, expected) => {
		expect(stripUrlQueries(url)).toBe(expected);
	});

	it('removes the query string from each URL inside a longer string', () => {
		expect(
			stripUrlQueries(
				'Failed to fetch https://a.example.com/invite?token=abc and https://b.example.com/x?y=1',
			),
		).toBe(
			'Failed to fetch https://a.example.com/invite and https://b.example.com/x',
		);
	});

	it('leaves a string with no URL unchanged', () => {
		expect(stripUrlQueries('Is this a question? Yes')).toBe(
			'Is this a question? Yes',
		);
	});

	it('strips URLs in nested objects and arrays', () => {
		expect(
			stripUrlQueries({
				$current_url: 'https://app.example.com/invite?token=abc',
				nested: { list: ['https://app.example.com/a?b=1', 3] },
			}),
		).toEqual({
			$current_url: 'https://app.example.com/invite',
			nested: { list: ['https://app.example.com/a', 3] },
		});
	});

	it('leaves values that are not strings, arrays or plain objects as they are', () => {
		const timestamp = new Date('2026-11-14T00:00:00Z');

		const result = stripUrlQueries({
			timestamp,
			count: 2,
			on: true,
			none: null,
		});

		expect(result.timestamp).toBe(timestamp);
		expect(result).toEqual({ timestamp, count: 2, on: true, none: null });
	});
});
