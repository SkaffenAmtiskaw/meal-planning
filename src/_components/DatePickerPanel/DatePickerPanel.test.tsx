import { render } from '@testing-library/react';
import { it, vi } from 'vitest';

import { DatePickerPanel } from './DatePickerPanel';

vi.mock('../DatePickerGrid', () => ({
	DatePickerGrid: vi.fn(() => null),
}));

it('renders (coverage only, no logic)', () => {
	render(<DatePickerPanel value={null} onChange={vi.fn()} />);
});
