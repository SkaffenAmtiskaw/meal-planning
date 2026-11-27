import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InputBase } from '@mantine/core';

import { DateFieldTrigger } from './DateFieldTrigger';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

const lastInputProps = () =>
	vi.mocked(InputBase).mock.lastCall?.[0] as unknown as {
		labelProps: { id: string };
		'aria-labelledby': string;
	};

describe('DateFieldTrigger', () => {
	it('names the button from its label and the date it shows', () => {
		render(<DateFieldTrigger label="Date">11/26/2026</DateFieldTrigger>);

		const { labelProps, 'aria-labelledby': labelledBy } = lastInputProps();
		const [labelId, valueId] = labelledBy.split(' ');
		expect(labelId).toBe(labelProps.id);
		expect(document.getElementById(valueId)?.textContent).toBe('11/26/2026');
	});

	it('names an empty field from its label alone', () => {
		render(<DateFieldTrigger label="Date" />);

		const { labelProps, 'aria-labelledby': labelledBy } = lastInputProps();
		expect(labelledBy).toBe(labelProps.id);
		expect(screen.getByRole('button').textContent).toBe('');
	});
});
