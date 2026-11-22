import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { BottomSheet } from './BottomSheet';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('BottomSheet', () => {
	it('renders (coverage only, no logic)', () => {
		render(
			<BottomSheet opened onClose={vi.fn()} title="Jump to date">
				Content
			</BottomSheet>,
		);
	});
});
