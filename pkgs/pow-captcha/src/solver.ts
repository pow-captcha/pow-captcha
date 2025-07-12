import type { WorkerRequest, WorkerResponse } from "./solver-worker";
import { arrayStartsWith, chunkArray } from "./utils";

export async function solveJs(
	nonce: Uint8Array,
	target: Uint8Array,
): Promise<Uint8Array> {
	const arr = new Uint8Array(8 + nonce.byteLength);
	const solutionView = new DataView(arr.buffer, 0, 8);
	arr.set(nonce, 8);

	for (
		let i = BigInt(0);
		// eslint-disable-next-line no-constant-condition
		true;
		i++
	) {
		// using little-endian
		solutionView.setBigUint64(0, i, true);

		const hashArrayBuf = await crypto.subtle.digest("SHA-256", arr);
		const hash = new Uint8Array(hashArrayBuf);

		if (arrayStartsWith(hash, target)) {
			return new Uint8Array(
				solutionView.buffer,
				solutionView.byteOffset,
				solutionView.byteLength,
			);
		}
	}
}

export async function solveChallenges(
	challenges: ReadonlyArray<readonly [Uint8Array, Uint8Array]>,
	engine?: "wasm" | "js",
): Promise<Array<Uint8Array>> {
	const workerChallenges = chunkArray(
		Math.floor(challenges.length / navigator.hardwareConcurrency),
		challenges,
	);

	console.log("workerChallenges", workerChallenges);

	const workers = workerChallenges.map(async (challenges) => {
		const worker = new Worker(
			new URL("./solver-worker.js", import.meta.url),
			{
				type: "module",
			},
		);

		try {
			const resultPromise = new Promise<ReadonlyArray<Uint8Array>>(
				(onOk, onErr) => {
					worker.onerror = onErr;
					worker.onmessage = (m: MessageEvent<WorkerResponse>) => {
						console.log("worker msg", m);
						onOk(m.data.solutions);
					};
				},
			);

			const req: WorkerRequest = { challenges, engine };
			worker.postMessage(req);

			return await resultPromise;
		} finally {
			worker.terminate();
		}
	});

	return (await Promise.all(workers)).flat();
}

export async function verify(
	nonce: Uint8Array,
	target: Uint8Array,
	solution: Uint8Array,
): Promise<boolean> {
	const arr = new Uint8Array(solution.byteLength + nonce.byteLength);
	arr.set(solution);
	arr.set(nonce, solution.byteLength);

	const hashArrayBuf = await crypto.subtle.digest("SHA-256", arr);
	const hash = new Uint8Array(hashArrayBuf);

	return arrayStartsWith(hash, target);
}
