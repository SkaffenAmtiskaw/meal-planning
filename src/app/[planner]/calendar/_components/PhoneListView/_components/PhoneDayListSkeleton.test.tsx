import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { PhoneDayListSkeleton } from './PhoneDayListSkeleton';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('PhoneDayListSkeleton', () => {
	it('renders (coverage only, no logic)', () => {
		render(<PhoneDayListSkeleton />);
	});
});
