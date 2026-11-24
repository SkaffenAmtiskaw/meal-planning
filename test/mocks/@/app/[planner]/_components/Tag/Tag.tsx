/**
 * Shared mock for @/app/[planner]/_components/Tag/Tag.
 *
 * Usage in a test file:
 *   vi.mock('@/app/[planner]/_components/Tag/Tag', async () =>
 *     await import('#mocks/@/app/[planner]/_components/Tag/Tag')
 *   );
 *
 * Renders the tag's name in a span with data-testid "badge" and the tag's color in data-color.
 */

import { vi } from 'vitest';

import type { ReactNode } from 'react';

export const Tag = vi.fn(
	({ children, color }: { children: ReactNode; color: string }) => (
		<span data-testid="badge" data-color={color}>
			{children}
		</span>
	),
);
