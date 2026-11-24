import { describe, expect, it } from 'vitest';

import { withoutProtocol } from './withoutProtocol';

describe('withoutProtocol', () => {
	it('strips the https:// prefix', () => {
		expect(withoutProtocol('https://example.com')).toBe('example.com');
	});

	it('strips the http:// prefix', () => {
		expect(withoutProtocol('http://example.com')).toBe('example.com');
	});

	it('strips a protocol-relative // prefix', () => {
		expect(withoutProtocol('//example.com')).toBe('example.com');
	});

	it('returns the string unchanged when there is no protocol', () => {
		expect(withoutProtocol('example.com')).toBe('example.com');
	});

	it('keeps www. and path segments', () => {
		expect(withoutProtocol('https://www.example.com/path/')).toBe(
			'www.example.com/path/',
		);
	});

	it('returns an empty string for an empty input', () => {
		expect(withoutProtocol('')).toBe('');
	});
});
