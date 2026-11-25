import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { SectionLabel } from './SectionLabel';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SectionLabel', () => {
	it('renders (coverage only, no logic)', () => {
		render(<SectionLabel>Dishes</SectionLabel>);
	});
});
