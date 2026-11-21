import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AddMealGutterButton } from './AddMealGutterButton';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('AddMealGutterButton', () => {
	it('calls onClick when clicked', () => {
		const onClick = vi.fn();

		render(<AddMealGutterButton onClick={onClick} />);

		screen.getByRole('button').click();

		expect(onClick).toHaveBeenCalledTimes(1);
	});
});
