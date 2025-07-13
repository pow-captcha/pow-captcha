import { solveJs } from "./solver";
import { solve as solveWasm } from "@pow-captcha/solver-wasm";
import {
	WORKER_READY,
	type WorkerRequest,
	type WorkerResponse,
} from "./shared";

async function solve(
	nonce: Uint8Array,
	target: Uint8Array,
	engine: undefined | "js" | "wasm",
	difficultyBits: number,
): Promise<Uint8Array> {
	switch (engine) {
		case "js":
			return await solveJs(nonce, target, difficultyBits);

		case "wasm":
			return solveWasm(nonce, target, difficultyBits);

		case undefined:
			try {
				return solveWasm(nonce, target, difficultyBits);
			} catch (err) {
				console.warn(
					"pow-captcha: Falling back to js solver. Error: ",
					err,
				);
				return await solveJs(nonce, target, difficultyBits);
			}
	}
}

async function processMessage(m: MessageEvent<WorkerRequest>): Promise<void> {
	const { challenges, engine, difficultyBits } = m.data;

	// const solutions = await Promise.all(
	// 	challenges.map(([nonce, target]) => solve(nonce, target, engine)),
	// );

	const solutions: Array<Uint8Array> = [];
	for (const [nonce, target] of challenges) {
		const solution = await solve(nonce, target, engine, difficultyBits);
		solutions.push(solution);
	}

	const res: WorkerResponse = {
		solutions,
	};
	postMessage(res);
}

onerror = (m) => {
	console.error("pow-captcha: Failure in worker: ", m);
};

onmessage = (m: MessageEvent<WorkerRequest>) => {
	console.log("onmessage", m.data);
	processMessage(m).catch((err) => {
		console.error("pow-captcha: Failure in worker: ", err);
	});
};

// send worker ready
postMessage(WORKER_READY);
