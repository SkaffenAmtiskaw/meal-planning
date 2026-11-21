import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { UserMenu } from './UserMenu';

vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

vi.mock('./SignOutButton', () => ({
	SignOutButton: () => <div data-testid="sign-out-button">Log Out</div>,
}));

// InviteBadge is a server component that fetches; here it only passes its children through.
vi.mock('./InviteBadge', () => ({
	InviteBadge: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('UserMenu', () => {
	it('renders (coverage only, no logic)', () => {
		render(<UserMenu />);
	});
});
