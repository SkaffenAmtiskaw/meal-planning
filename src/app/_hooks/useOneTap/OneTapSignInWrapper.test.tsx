import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { OneTapSignInWrapper } from './OneTapSignInWrapper';
import { useOneTap } from './useOneTap';

vi.mock('./useOneTap', () => ({ useOneTap: vi.fn() }));

describe('one tap sign in wrapper', () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	test('renders children', () => {
		render(
			<OneTapSignInWrapper>
				<div>Maleficent&apos;s Portal</div>
			</OneTapSignInWrapper>,
		);

		expect(screen.getByText("Maleficent's Portal")).toBeDefined();
	});

	test('calls useOneTap on mount', () => {
		render(
			<OneTapSignInWrapper>
				<span />
			</OneTapSignInWrapper>,
		);

		expect(useOneTap).toHaveBeenCalledOnce();
	});
});
