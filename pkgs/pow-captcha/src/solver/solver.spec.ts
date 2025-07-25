import { describe, it, expect } from "@jest/globals";
import * as solver from "./solver";

describe("solver", () => {
	it("solveJs", async () => {
		expect(
			await solver.solveJs(
				new Uint8Array([1, 2]),
				new Uint8Array([3, 4, 5]),
				18,
			),
		).toStrictEqual(new Uint8Array([45, 176, 0, 0, 0, 0, 0, 0]));
	});

	it("verify", async () => {
		expect(
			await solver.verify(
				new Uint8Array([1, 2]),
				new Uint8Array([3, 4, 5]),
				18,
				new Uint8Array([45, 176, 0, 0, 0, 0, 0, 0]),
			),
		).toStrictEqual(true);
	});
});
