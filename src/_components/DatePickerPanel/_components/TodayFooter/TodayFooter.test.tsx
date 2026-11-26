import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ReactNode } from 'react';

import { Button, type ButtonProps } from '@mantine/core';

import { DateTime } from 'luxon';

import { makeKnownDay, makeUnknownDay } from '#fixtures/viewerDay';
import { useToday } from '@/_hooks';

import { TodayFooter } from './TodayFooter';

vi.mock('@/_hooks', async () => await import('#mocks/@/_hooks'));
vi.mock('@mantine/core', async () => await import('#mocks/@mantine/core'));

// Renders the date the Today button shows beside its label.
function renderShownDate(): void {
	// The shared Button mock doesn't draw its right section, and Mantine's polymorphic types hide its props.
	const props = vi.mocked(Button).mock.lastCall?.[0] as unknown as ButtonProps;
	render(props.rightSection as ReactNode);
}

describe('TodayFooter', () => {
	afterEach(() => {
		vi.mocked(useToday).mockReset();
	});

	describe('once the day is known', () => {
		it("shows today's short date", () => {
			vi.mocked(useToday).mockReturnValue(
				makeKnownDay(DateTime.fromISO('2026-11-26')),
			);
			render(<TodayFooter onPick={vi.fn()} />);
			renderShownDate();

			expect(screen.getByTestId('skeleton').dataset.visible).toBe('false');
			expect(screen.getByTestId('skeleton').textContent).toBe('Thu, Nov 26');
		});

		it('picks today', () => {
			vi.mocked(useToday).mockReturnValue(
				makeKnownDay(DateTime.fromISO('2026-11-26')),
			);
			const onPick = vi.fn();
			render(<TodayFooter onPick={onPick} />);

			fireEvent.click(screen.getByRole('button', { name: 'Today' }));

			expect(onPick).toHaveBeenCalledWith('2026-11-26');
		});
	});

	describe.each([
		['in the middle of a month', '2026-11-26'],
		["on a month's last day", '2026-11-30'],
		["on a month's first day", '2026-12-01'],
	])('while the day is unknown %s', (_, utcDay) => {
		it('disables the Today button', () => {
			vi.mocked(useToday).mockReturnValue(
				makeUnknownDay(DateTime.fromISO(utcDay)),
			);
			render(<TodayFooter onPick={vi.fn()} />);

			expect(
				(screen.getByRole('button', { name: 'Today' }) as HTMLButtonElement)
					.disabled,
			).toBe(true);
		});

		it('shows its date under a skeleton', () => {
			vi.mocked(useToday).mockReturnValue(
				makeUnknownDay(DateTime.fromISO(utcDay)),
			);
			render(<TodayFooter onPick={vi.fn()} />);
			renderShownDate();

			expect(screen.getByTestId('skeleton').dataset.visible).toBe('true');
		});
	});
});
