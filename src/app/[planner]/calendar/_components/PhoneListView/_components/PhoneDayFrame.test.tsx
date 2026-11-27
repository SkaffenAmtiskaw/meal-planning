import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { PhoneDayFrame } from './PhoneDayFrame';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('PhoneDayFrame', () => {
	it('renders (coverage only, no logic)', () => {
		render(<PhoneDayFrame header={<div />}>content</PhoneDayFrame>);
	});
});
