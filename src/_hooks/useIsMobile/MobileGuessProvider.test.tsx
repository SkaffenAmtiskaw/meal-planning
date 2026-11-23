import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { MobileGuessProvider } from './MobileGuessProvider';

describe('MobileGuessProvider', () => {
	it('renders (coverage only, no logic)', () => {
		render(<MobileGuessProvider isMobile>{null}</MobileGuessProvider>);
	});
});
