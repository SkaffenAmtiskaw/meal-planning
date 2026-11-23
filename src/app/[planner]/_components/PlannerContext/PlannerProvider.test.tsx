import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type ReactNode, useContext } from 'react';

import { PlannerContext } from './PlannerContext';
import { PlannerProvider } from './PlannerProvider';

describe('PlannerProvider', () => {
	it('provides the access level to context', () => {
		const wrapper = ({ children }: { children: ReactNode }) => (
			<PlannerProvider accessLevel="owner">{children}</PlannerProvider>
		);

		const { result } = renderHook(() => useContext(PlannerContext), {
			wrapper,
		});

		expect(result.current).toEqual({ accessLevel: 'owner' });
	});
});
