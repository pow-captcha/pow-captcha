import { utils, wire } from "@pow-captcha/shared";
import * as solver from "@pow-captcha/solver";

export type CreateChallengesOptions = {
	/** @default 50 */
	challengeCount?: number;
	/** @default 16 */
	challengeLength?: number;
	/** @default 2 */
	difficulty?: number;
};

export async function createChallenges(
	{
		challengeCount = 50,
		challengeLength = 16,
		difficulty = 2,
	}: CreateChallengesOptions,
	secret: string,
): Promise<wire.SignedData> {
	const challenges = utils.createArray(
		challengeCount,
		(): wire.ChallengeEntry => {
			const challenge = new Uint8Array(challengeLength);
			crypto.getRandomValues(challenge);

			const target = new Uint8Array(difficulty);
			crypto.getRandomValues(target);

			return [
				wire.serializeArray(challenge),
				wire.serializeArray(target),
			];
		},
	);

	const challenge: wire.Challenge = {
		magic: wire.CHALLENGE_MAGIC,
		challenges,
	};
	return await wire.serializeAndSignData(challenge, secret);
}

export async function redeemChallengeSolution(
	{ challengesSigned, solutions }: wire.ChallengeSolution,
	secret: string,
): Promise<wire.SignedData> {
	const challengesWire = await wire.verifyAndDeserializeData(
		challengesSigned,
		wire.challengeSchema,
		secret,
	);

	if (challengesWire.challenges.length !== solutions.length) {
		throw new Error(
			`Number of solutions does not match the number of challenges`,
		);
	}

	const verifyTasks = challengesWire.challenges.map(async (challenge, i) => {
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

	const redeemed: wire.Redeemed = {
		magic: wire.REDEEMED_MAGIC,
	};
	return await wire.serializeAndSignData(redeemed, secret);
}

export async function verifyRedeemed(
	redeemedSigned: wire.SignedData,
	secret: string,
): Promise<void> {
	await wire.verifyAndDeserializeData(
		redeemedSigned,
		wire.redeemedSchema,
		secret,
	);
}
