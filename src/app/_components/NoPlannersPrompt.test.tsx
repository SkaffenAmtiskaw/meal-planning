import { render } from '@testing-library/react';
import { describe, it, vi } from 'vitest';

import { NoPlannersPrompt } from './NoPlannersPrompt';

vi.mock('./AuthLayout', () => ({
	AuthLayoutRoot: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	AuthLayoutHeader: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

describe('no planners prompt', () => {
	it('renders (coverage only, no logic)', () => {
		render(<NoPlannersPrompt />);
	});
});
