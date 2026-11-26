import { render } from '@testing-library/react';
import { it, vi } from 'vitest';

import { DateFieldTrigger } from './DateFieldTrigger';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

it('renders (coverage only, no logic)', () => {
	render(<DateFieldTrigger label="Date">11/26/2026</DateFieldTrigger>);
});
