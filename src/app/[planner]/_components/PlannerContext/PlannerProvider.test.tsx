import { useContext } from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { PlannerContext } from './PlannerContext';
import { PlannerProvider } from './PlannerProvider';

const mockGetPlannerClient = vi.fn();
vi.mock('@/_actions', () => ({
	getPlannerClient: (...args: unknown[]) => mockGetPlannerClient(...args),
}));

const id = '507f1f77bcf86cd799439011';
const accessLevel = 'owner' as const;

const maleficentsPlanner = { calendar: [], saved: [], tags: [] };

describe('PlannerProvider', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('calls getPlannerClient with the provided id', async () => {
		mockGetPlannerClient.mockResolvedValue(maleficentsPlanner);

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				{null}
			</PlannerProvider>,
		);

		await waitFor(() => {
			expect(mockGetPlannerClient).toHaveBeenCalledWith(id);
		});
	});

	test('provides planner data to context', async () => {
		mockGetPlannerClient.mockResolvedValue(maleficentsPlanner);

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

	test('renders children', async () => {
		mockGetPlannerClient.mockResolvedValue(maleficentsPlanner);

		render(
			<PlannerProvider id={id} accessLevel={accessLevel}>
				<div>Maleficent's Kitchen</div>
			</PlannerProvider>,
		);

		expect(await screen.findByText("Maleficent's Kitchen")).toBeDefined();
	});

	test('rethrows errors from getPlannerClient', async () => {
		const error = new Error('fetch failed');
		mockGetPlannerClient.mockRejectedValue(error);

		const priorListeners = process.rawListeners('unhandledRejection') as ((
			...args: unknown[]
		) => void)[];
		process.removeAllListeners('unhandledRejection');

		let caughtError: unknown;
		process.once('unhandledRejection', (reason) => {
			caughtError = reason;
		});

		try {
			render(
				<PlannerProvider id={id} accessLevel={accessLevel}>
					{null}
				</PlannerProvider>,
			);

			await waitFor(() => {
				expect(caughtError).toBe(error);
			});
		} finally {
			process.removeAllListeners('unhandledRejection');
			for (const fn of priorListeners) {
				process.on('unhandledRejection', fn);
			}
		}
	});

	test('includes accessLevel in context value', async () => {
		mockGetPlannerClient.mockResolvedValue(maleficentsPlanner);

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
			const context = contextValue as { accessLevel: string };
			expect(context.accessLevel).toBe(accessLevel);
		});
	});
});
