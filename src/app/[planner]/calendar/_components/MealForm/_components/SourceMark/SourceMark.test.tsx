import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { SourceMark } from './SourceMark';

describe('SourceMark', () => {
	it('renders (coverage only, no logic)', () => {
		render(<SourceMark kind="saved" />);
	});
});
