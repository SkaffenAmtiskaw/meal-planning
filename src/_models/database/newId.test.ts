import { describe, expect, test } from 'vitest';

import { zId } from '@/_utils/zId';

import { newId } from './newId';

describe('newId', () => {
	test('gives an id with the shape zId accepts', () => {
		expect(zId.safeParse(newId()).success).toBe(true);
	});

	test('gives a different id each time', () => {
		expect(newId()).not.toBe(newId());
	});
});
