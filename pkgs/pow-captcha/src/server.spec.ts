import { describe, it, expect } from "@jest/globals";
import * as wire from "./wire";
import * as server from "./server";

const SECRET = "e2c0b4ab-a215-4b36-bba8-19fae1601045";

describe("server", () => {
	it("createChallenges ok", async () => {
		const challengesSigned = await server.createChallenges({}, SECRET);

		await wire.verifyAndDeserializeData(
			challengesSigned,
			wire.challengeSchema,
			SECRET,
		);
	});

	it("createChallenges wrong secret", async () => {
		const challengesSigned = await server.createChallenges({}, SECRET);

		await expect(
			(async () => {
				await wire.verifyAndDeserializeData(
					challengesSigned,
					wire.challengeSchema,
					"wrong-secret",
				);
			})(),
		).rejects.toThrow("Signed data verification failed, hash mismatch");
	});
});
