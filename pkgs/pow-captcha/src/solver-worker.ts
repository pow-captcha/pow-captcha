import * as solver from "./solver";
import * as wasm from "@pow-captcha/solver-wasm";
import {
	WORKER_READY,
	type WorkerRequest,
	type WorkerResponse,
} from "./solver-shared";

async function solve(
	nonce: Uint8Array,
	target: Uint8Array,
	engine: undefined | "js" | "wasm",
): Promise<Uint8Array> {
	switch (engine) {
		case "js":
			return await solver.solveJs(nonce, target);

		case "wasm":
			return wasm.solve(nonce, target);

		case undefined:
			try {
				return wasm.solve(nonce, target);
			} catch (err) {
				console.warn(
					"pow-captcha: Falling back to js solver. Error: ",
					err,
				);
				return await solver.solveJs(nonce, target);
			}
	}
}

async function processMessage(m: MessageEvent<WorkerRequest>): Promise<void> {
	const { challenges, engine } = m.data;

	// const solutions = await Promise.all(
	// 	challenges.map(([nonce, target]) => solve(nonce, target, engine)),
	// );

	const solutions: Array<Uint8Array> = [];
	for (const [nonce, target] of challenges) {
		const solution = await solve(nonce, target, engine);
		solutions.push(solution);
	}

	const res: WorkerResponse = {
		solutions,
	};
	postMessage(res);
}

onmessage = (m: MessageEvent<WorkerRequest>) => {
	console.log("onmessage", m);
	processMessage(m).catch((err) => {
		console.error("pow-captcha: Failure in worker: ", err);
	});
};

// send worker ready
postMessage(WORKER_READY);
