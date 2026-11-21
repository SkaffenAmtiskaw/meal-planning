import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

import { InviteCountBadge } from './InviteCountBadge';

describe('InviteCountBadge', () => {
	it('renders (coverage only, no logic)', () => {
		render(
			<InviteCountBadge count={2}>
				<div>Child</div>
			</InviteCountBadge>,
		);
	});
});
