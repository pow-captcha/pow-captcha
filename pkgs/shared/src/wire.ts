import { z } from "zod";
import {
	fromByteArray as serializeArray,
	toByteArray as deserializeArray,
} from "base64-js";

export { serializeArray, deserializeArray };

export const signedDataSchema = z.object({
	data: z.string(),
	hash: z.string(),
});
export type SignedData = z.output<typeof signedDataSchema>;

export const challengeEntrySchema = z.tuple([z.string(), z.string()]);
export type ChallengeEntry = z.output<typeof challengeEntrySchema>;

export const CHALLENGE_MAGIC = "2104f639-ba1b-48f3-9443-889128163f5a";

export const challengeSchema = z.object({
	magic: z.literal(CHALLENGE_MAGIC),
	challenges: z.array(challengeEntrySchema),
});
export type Challenge = z.output<typeof challengeSchema>;

export const challengeSolutionSchema = z.object({
	challengesSigned: signedDataSchema,
	solutions: z.array(z.string()),
});
export type ChallengeSolution = z.output<typeof challengeSolutionSchema>;

export const REDEEMED_MAGIC = "90a63087-993a-4376-9532-33c3dc8557c9";

export const redeemedSchema = z.object({
	magic: z.literal(REDEEMED_MAGIC),
});
export type Redeemed = z.output<typeof redeemedSchema>;

export async function serializeAndSignData<T>(
	data: T,
	secret: string,
): Promise<SignedData> {
	const json = JSON.stringify(data);
	const arr = utf16StringToArrayBuffer(`${json}:${secret}`);
	const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", arr));
	return {
		data: json,
		hash: serializeArray(hash),
	};
}

export async function verifyAndDeserializeData<T>(
	signedData: SignedData,
	schema: z.ZodType<T>,
	secret: string,
): Promise<T> {
	const arr = utf16StringToArrayBuffer(`${signedData.data}:${secret}`);
	const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", arr));
	if (hash !== deserializeArray(signedData.hash)) {
		throw new Error(`Signed data verification failed, hash mismatch`);
	}
	const data = JSON.parse(signedData.data);
	return await schema.parseAsync(data);
}

export function utf16StringToArrayBuffer(input: string): ArrayBuffer {
	const arr = new Uint16Array(input.length);
	for (let i = 0, strLen = input.length; i < strLen; i += 1) {
		arr[i] = input.charCodeAt(i);
	}
	return arr.buffer;
}
