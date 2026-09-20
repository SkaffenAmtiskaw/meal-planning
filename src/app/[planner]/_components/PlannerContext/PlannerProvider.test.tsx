import { useContext } from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { describe, expect, it, vi } from 'vitest';

import { getPlannerClient } from '@/_actions/planner';

import { PlannerContext } from './PlannerContext';
import { PlannerProvider } from './PlannerProvider';

vi.mock(
	'@/_actions/planner',
	async () => await import('@mocks/@/_actions/planner'),
);

const id = '507f1f77bcf86cd799439011';
const accessLevel = 'owner' as const;

const maleficentsPlanner = { calendar: [], saved: [], tags: [] };

describe('PlannerProvider', () => {
	it('calls getPlannerClient with the provided id', async () => {
		vi.mocked(getPlannerClient).mockResolvedValueOnce(maleficentsPlanner);

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				{null}
			</PlannerProvider>,
		);

		await waitFor(() => {
			expect(getPlannerClient).toHaveBeenCalledWith(id);
		});
	});

	it('provides planner data to context', async () => {
		vi.mocked(getPlannerClient).mockResolvedValueOnce(maleficentsPlanner);

		let contextValue: unknown;
		const ContextReader = () => {
			contextValue = useContext(PlannerContext);
			return null;
		};

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				<ContextReader />
			</PlannerProvider>,
		);

		await waitFor(() => {
			expect(contextValue).toEqual({ ...maleficentsPlanner, accessLevel });
		});
	});

	it('renders children', async () => {
		vi.mocked(getPlannerClient).mockResolvedValueOnce(maleficentsPlanner);

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				<div>Maleficent's Kitchen</div>
			</PlannerProvider>,
		);

		expect(await screen.findByText("Maleficent's Kitchen")).toBeDefined();
	});

	it('rethrows errors from getPlannerClient', async () => {
		const error = new Error('fetch failed');
		vi.mocked(getPlannerClient).mockRejectedValueOnce(error);

		const noop = () => {};
		process.on('unhandledRejection', noop);

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				{null}
			</PlannerProvider>,
		);

		await waitFor(() => {
			expect(getPlannerClient).toHaveBeenCalledWith(id);
		});

		process.off('unhandledRejection', noop);
	});
});
