import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LinkModeBanner } from './LinkModeBanner';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('LinkModeBanner', () => {
	it('names the dish being linked, and cancels', () => {
		const onCancel = vi.fn();
		render(<LinkModeBanner dishName="chicken" onCancel={onCancel} />);
		expect(screen.getByTestId('link-mode-banner').textContent).toContain(
			'Linking to chicken',
		);

		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onCancel).toHaveBeenCalled();
	});

	it('says the dish has no name when it has none', () => {
		render(<LinkModeBanner dishName=" " onCancel={vi.fn()} />);

		expect(screen.getByTestId('link-mode-banner').textContent).toContain(
			'Linking to a dish with no name',
		);
	});
});
