import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { SettingsMenuItem } from './SettingsMenuItem';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

describe('SettingsMenuItem', () => {
	it('renders (coverage only, no logic)', () => {
		render(<SettingsMenuItem />);
	});
});
