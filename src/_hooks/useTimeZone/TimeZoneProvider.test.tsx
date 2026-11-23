import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderToString } from 'react-dom/server';

import { TimeZoneProvider } from './TimeZoneProvider';
import { useTimeZone } from './useTimeZone';

const ShowTimeZone = () => (
	<span data-testid="zone">{useTimeZone() ?? 'none'}</span>
);

describe('TimeZoneProvider', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('with no zone passed', () => {
		it('gives no zone while the server draws', () => {
			const html = renderToString(
				<TimeZoneProvider timeZone={null}>
					<ShowTimeZone />
				</TimeZoneProvider>,
			);

			expect(html).toContain('none');
		});

		it("gives the browser's zone once mounted", () => {
			vi.spyOn(
				Intl.DateTimeFormat.prototype,
				'resolvedOptions',
			).mockReturnValue({
				timeZone: 'Asia/Tokyo',
			} as Intl.ResolvedDateTimeFormatOptions);

			render(
				<TimeZoneProvider timeZone={null}>
					<ShowTimeZone />
				</TimeZoneProvider>,
			);

			expect(screen.getByTestId('zone').textContent).toBe('Asia/Tokyo');
		});
	});

	it('gives the passed zone while the server draws', () => {
		const html = renderToString(
			<TimeZoneProvider timeZone="Pacific/Kiritimati">
				<ShowTimeZone />
			</TimeZoneProvider>,
		);

		expect(html).toContain('Pacific/Kiritimati');
	});
});
