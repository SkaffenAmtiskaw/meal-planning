import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddMealRow } from './AddMealRow';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('AddMealRow', () => {
	it('calls onClick when clicked', () => {
		const onClick = vi.fn();

		render(<AddMealRow onClick={onClick} />);

		screen.getByRole('button', { name: 'Add meal' }).click();

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
