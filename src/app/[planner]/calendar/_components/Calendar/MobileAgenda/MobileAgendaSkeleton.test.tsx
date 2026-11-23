import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { MobileAgendaSkeleton } from './MobileAgendaSkeleton';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('MobileAgendaSkeleton', () => {
	it('renders (coverage only, no logic)', () => {
		render(<MobileAgendaSkeleton />);
	});
});
