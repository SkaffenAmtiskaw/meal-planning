import { describe, expect, it } from 'vitest';

import { formatSourceChip } from './formatSourceChip';

describe('formatSourceChip', () => {
	it('strips the https:// prefix', () => {
		expect(formatSourceChip('https://example.com')).toBe('example.com');
	});

	it('strips the http:// prefix', () => {
		expect(formatSourceChip('http://example.com')).toBe('example.com');
	});

	it('strips a protocol-relative // prefix', () => {
		expect(formatSourceChip('//example.com')).toBe('example.com');
	});

	it('returns the string unchanged when there is no protocol', () => {
		expect(formatSourceChip('example.com')).toBe('example.com');
	});

	it('keeps www. and path segments', () => {
		expect(formatSourceChip('https://www.example.com/path/')).toBe(
			'www.example.com/path/',
		);
	});

	it('returns an empty string for an empty input', () => {
		expect(formatSourceChip('')).toBe('');
	});
});
