import * as solver from "./solver";
// import * as wasm from "@pow-captcha/solver-wasm";

export type Challenge = readonly [Uint8Array, Uint8Array];

export type WorkerRequest = {
	engine?: undefined | "js" | "wasm";
	challenges: ReadonlyArray<Challenge>;
};

export type WorkerResponse = {
	solutions: ReadonlyArray<Uint8Array>;
};

async function solveWasm(
	nonce: Uint8Array,
	target: Uint8Array,
): Promise<Uint8Array> {
	const wasm = await import("@pow-captcha/solver-wasm");
	return wasm.solve(nonce, target);
}

async function solve(
	nonce: Uint8Array,
	target: Uint8Array,
	engine: undefined | "js" | "wasm",
): Promise<Uint8Array> {
	switch (engine) {
		case "js":
			return await solver.solveJs(nonce, target);

		case "wasm":
			return await solveWasm(nonce, target);

		case undefined:
			try {
				return await solveWasm(nonce, target);
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
