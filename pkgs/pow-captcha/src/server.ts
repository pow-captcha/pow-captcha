import * as wire from "./wire";
import * as solver from "./solver";
import { createArray } from "./utils";

export type CreateChallengesOptions = {
	/** @default 50 */
	challengeCount?: number;
	/** @default 16 */
	challengeLength?: number;
	/** @default 2 */
	difficulty?: number;
};

export async function createChallengesRaw({
	challengeCount = 50,
	challengeLength = 16,
	difficulty = 2,
}: CreateChallengesOptions): Promise<wire.Challenge> {
	const challenges = createArray(challengeCount, (): wire.ChallengeEntry => {
		const challenge = new Uint8Array(challengeLength);
		crypto.getRandomValues(challenge);

		const target = new Uint8Array(difficulty);
		crypto.getRandomValues(target);

		return [wire.serializeArray(challenge), wire.serializeArray(target)];
	});

	return {
		magic: wire.CHALLENGE_MAGIC,
		challenges,
	};
}

export async function createChallenges(
	options: CreateChallengesOptions,
	secret: string,
): Promise<wire.SignedData> {
	const data = await createChallengesRaw(options);
	return await wire.serializeAndSignData(data, secret);
}

export async function redeemChallengeSolutionRaw(
	challenges: wire.Challenge,
	solutions: Array<string>,
): Promise<wire.Redeemed> {
	if (challenges.challenges.length !== solutions.length) {
		throw new Error(
			`Number of solutions does not match the number of challenges`,
		);
	}

	const verifyTasks = challenges.challenges.map(async (challenge, i) => {
		const solution = solutions[i]!;
		const isValid = await solver.verify(
			wire.deserializeArray(challenge[0]),
			wire.deserializeArray(challenge[1]),
			wire.deserializeArray(solution),
		);
		if (!isValid) {
			throw new Error(`The solution with index ${i} is invalid`);
		}
	});
	await Promise.all(verifyTasks);

	return {
		magic: wire.REDEEMED_MAGIC,
	};
}

export async function redeemChallengeSolution(
	{ challengesSigned, solutions }: wire.ChallengeSolution,
	secret: string,
): Promise<wire.SignedData> {
	const challenges = await wire.verifyAndDeserializeData(
		challengesSigned,
		wire.challengeSchema,
		secret,
	);

	const redeemed = await redeemChallengeSolutionRaw(challenges, solutions);

	return await wire.serializeAndSignData(redeemed, secret);
}

export async function verifyRedeemed(
	redeemedSigned: wire.SignedData,
	secret: string,
): Promise<wire.Redeemed> {
	return await wire.verifyAndDeserializeData(
		redeemedSigned,
		wire.redeemedSchema,
		secret,
	);
}
