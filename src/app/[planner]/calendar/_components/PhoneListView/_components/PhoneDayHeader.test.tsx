import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { DateTime } from 'luxon';

import { PhoneDayHeader } from './PhoneDayHeader';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('PhoneDayHeader', () => {
	it('renders (coverage only, no logic)', () => {
		render(
			<PhoneDayHeader date={DateTime.local(2026, 11, 21)} isToday={false} />,
		);
	});
});
