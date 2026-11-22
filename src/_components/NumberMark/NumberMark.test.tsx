import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NumberMark } from './NumberMark';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('NumberMark', () => {
	it('bolds a ringed number', () => {
		render(<NumberMark ring>24</NumberMark>);

		expect(screen.getByText('24').getAttribute('fw')).toBe('700');
	});

	it('does not bold a plain number', () => {
		render(<NumberMark>24</NumberMark>);

		expect(screen.getByText('24').getAttribute('fw')).toBeNull();
	});

	it('shows a muted number in pale navy', () => {
		render(<NumberMark muted>2</NumberMark>);

		expect(screen.getByText('2').getAttribute('data-c')).toBe('navy.3');
	});

	it('shows a number in navy', () => {
		render(<NumberMark>12</NumberMark>);

		expect(screen.getByText('12').getAttribute('data-c')).toBe('navy.5');
	});
});
