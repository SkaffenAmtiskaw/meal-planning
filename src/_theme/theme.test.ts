import { describe, expect, it } from "vitest";

import { theme } from "./theme";

describe("theme", () => {
	it("has forest as primary color", () => {
		expect(theme.primaryColor).toBe("forest");
	});

	it("has ember, forest, and navy in color ramps", () => {
		expect(theme.colors).toHaveProperty("ember");
		expect(theme.colors).toHaveProperty("forest");
		expect(theme.colors).toHaveProperty("navy");
		const ember = theme.colors?.ember as unknown as readonly string[];
		const forest = theme.colors?.forest as unknown as readonly string[];
		const navy = theme.colors?.navy as unknown as readonly string[];
		expect(ember.length).toBe(10);
		expect(forest.length).toBe(10);
		expect(navy.length).toBe(10);
	});

	it("has component overrides configured", () => {
		expect(theme.components).toBeDefined();
		expect(theme.components).toHaveProperty("AppShell");
		expect(theme.components).toHaveProperty("Button");
	});

	it("has default radius set to md", () => {
		expect(theme.defaultRadius).toBe("md");
	});
});
