import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DateFieldTrigger } from './DateFieldTrigger';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('DateFieldTrigger', () => {
	it('points its chevron down while closed', () => {
		const { container } = render(
			<DateFieldTrigger
				label="Date"
				date="2026-09-24"
				dateStyle="numericDate"
				opened={false}
			/>,
		);

		expect(container.querySelector('.tabler-icon-chevron-down')).not.toBeNull();
		expect(container.querySelector('.tabler-icon-chevron-up')).toBeNull();
	});

	it('points its chevron up while open', () => {
		const { container } = render(
			<DateFieldTrigger
				label="Date"
				date="2026-09-24"
				dateStyle="numericDate"
				opened
			/>,
		);

		expect(container.querySelector('.tabler-icon-chevron-up')).not.toBeNull();
		expect(container.querySelector('.tabler-icon-chevron-down')).toBeNull();
	});
});
