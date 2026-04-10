"use client";

import { createTheme } from "@mantine/core";

import { EMBER_RAMPS, FOREST_RAMPS, NAVY_RAMPS } from "./colors";

export const theme = createTheme({
	fontFamily: "Inter, sans-serif",
	fontFamilyMonospace: "JetBrains Mono, monospace",
	primaryColor: "forest",
	primaryShade: { light: 5, dark: 6 },
	defaultRadius: "md",
	colors: {
		ember: EMBER_RAMPS,
		forest: FOREST_RAMPS,
		navy: NAVY_RAMPS,
	},
	components: {
		AppShell: {
			styles: {
				header: {
					backgroundColor: "#1C3144",
					borderBottom: "none",
				},
				navbar: {
					backgroundColor: "#B1BA95",
					borderRight: "none",
				},
			},
		},
		Button: {
			defaultProps: { radius: "md" },
		},
		Input: {
			styles: {
				input: {
					backgroundColor: "#FFFFFF",
					borderColor: "#C8C0C3",
					"&:focus": {
						borderColor: "rgba(68, 99, 63, 0.4)",
					},
				},
			},
		},
		InputWrapper: {
			styles: {
				input: {
					"&:focus-within": {
						borderColor: "rgba(68, 99, 63, 0.4)",
					},
				},
			},
		},
		Modal: {
			defaultProps: {
				radius: "md",
				overlayProps: { blur: 2 },
			},
		},
		Anchor: {
			defaultProps: {
				c: "forest",
			},
		},
		Tabs: {
			defaultProps: {
				color: "forest",
			},
		},
		SegmentedControl: {
			styles: {
				label: {
					color: "#44633F",
				},
			},
		},
	},
});
