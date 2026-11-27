import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { PhoneDayHeader } from './PhoneDayHeader';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('PhoneDayHeader', () => {
	it('renders (coverage only, no logic)', () => {
		render(<PhoneDayHeader label="Sat 21 Nov" />);
	});
});
