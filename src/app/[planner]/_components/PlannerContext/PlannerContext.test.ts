import { useContext } from 'react';

import { renderHook } from '@testing-library/react';

import { describe, expect, test } from 'vitest';

import { PlannerContext } from './PlannerContext';

describe('planner context', () => {
	test('is a valid React context with default value null', () => {
		expect(PlannerContext).toHaveProperty('Provider');
		expect(PlannerContext).toHaveProperty('Consumer');

		const { result } = renderHook(() => useContext(PlannerContext));
		expect(result.current).toBeNull();
	});
});
