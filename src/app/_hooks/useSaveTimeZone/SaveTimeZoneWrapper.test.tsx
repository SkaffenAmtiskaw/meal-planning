import { render } from '@testing-library/react';
import { describe, test, vi } from 'vitest';

import { SaveTimeZoneWrapper } from './SaveTimeZoneWrapper';

vi.mock('./useSaveTimeZone', () => ({ useSaveTimeZone: vi.fn() }));

describe('save time zone wrapper', () => {
	test('renders (coverage only, no logic)', () => {
		render(
			<SaveTimeZoneWrapper>
				<span />
			</SaveTimeZoneWrapper>,
		);
	});
});
