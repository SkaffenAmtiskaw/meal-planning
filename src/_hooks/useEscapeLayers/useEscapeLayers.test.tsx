import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type ReactNode, useState } from 'react';

import {
	EscapeLayersProvider,
	useEscapeLayer,
	useEscapeLayers,
} from './useEscapeLayers';

// A frame with one layer inside it, whose open state the test sets.
function useFrameWithLayer(initialOpen: boolean) {
	const layers = useEscapeLayers();
	const [open, setOpen] = useState(initialOpen);
	return { layers, open, setOpen };
}

describe('useEscapeLayers', () => {
	it('has no layer open at first', () => {
		const { result } = renderHook(() => useEscapeLayers());

		expect(result.current.anyOpen).toBe(false);
	});

	it('counts each registered layer until it unregisters', () => {
		const { result } = renderHook(() => useEscapeLayers());

		let unregisterFirst = () => {};
		let unregisterSecond = () => {};
		act(() => {
			unregisterFirst = result.current.register();
			unregisterSecond = result.current.register();
		});
		expect(result.current.anyOpen).toBe(true);

		act(() => unregisterFirst());
		expect(result.current.anyOpen).toBe(true);

		act(() => unregisterSecond());
		expect(result.current.anyOpen).toBe(false);
	});
});

describe('useEscapeLayer', () => {
	const renderFrame = (initialOpen: boolean) => {
		const frame = renderHook(() => useFrameWithLayer(initialOpen));
		const layer = renderHook(
			({ open }: { open: boolean }) => useEscapeLayer(open),
			{
				initialProps: { open: initialOpen },
				wrapper: ({ children }: { children: ReactNode }) => (
					<EscapeLayersProvider value={frame.result.current.layers.register}>
						{children}
					</EscapeLayersProvider>
				),
			},
		);
		return { frame, layer };
	};

	it('tells the frame while the layer is open', () => {
		const { frame } = renderFrame(true);

		expect(frame.result.current.layers.anyOpen).toBe(true);
	});

	it('tells the frame nothing while the layer is closed', () => {
		const { frame } = renderFrame(false);

		expect(frame.result.current.layers.anyOpen).toBe(false);
	});

	it('unregisters when the layer closes', () => {
		const { frame, layer } = renderFrame(true);

		layer.rerender({ open: false });

		expect(frame.result.current.layers.anyOpen).toBe(false);
	});

	it('unregisters when the layer unmounts while open', () => {
		const { frame, layer } = renderFrame(true);

		layer.unmount();

		expect(frame.result.current.layers.anyOpen).toBe(false);
	});

	it('does nothing outside a frame', () => {
		expect(() => renderHook(() => useEscapeLayer(true))).not.toThrow();
	});
});
