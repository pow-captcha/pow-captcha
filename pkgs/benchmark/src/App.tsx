// import * as wasm from "@pow-captcha/solver-wasm";
import * as powCaptcha from "@pow-captcha/pow-captcha";
import { useEffect, useRef, useState } from "react";

async function benchmark(cb: () => void | Promise<void>): Promise<number> {
	const start = performance.now();
	await cb();
	const end = performance.now();
	return end - start;
}

export default function App() {
	const [durationJs, _setDurationJs] = useState<null | number>(null);
	const [durationWasm, setDurationWasm] = useState<null | number>(null);

	const [runBenchmark, setRunBenchmark] = useState(false);

	const initStartedRef = useRef(false);

	useEffect(() => {
		if (!runBenchmark || initStartedRef.current) {
			return;
		}

		initStartedRef.current = true;

		async function init() {
			const challengesRaw = await powCaptcha.server.createChallengesRaw({
				difficultyBits: 18,
				challengeCount: 32,
			});

			const challenges = challengesRaw.challenges.map(
				(challenge) =>
					[
						powCaptcha.wire.deserializeArray(challenge[0]),
						powCaptcha.wire.deserializeArray(challenge[1]),
					] as const,
			);

			const durationWasm = await benchmark(async () => {
				const solutions = await powCaptcha.solver.solveChallenges({
					difficultyBits: challengesRaw.difficultyBits,
					challenges,
					engine: "wasm",
				});
				console.log("wasm solutions", solutions);
			});
			setDurationWasm(durationWasm);

			// const durationJs = await benchmark(async () => {
			// 	const solutions = await powCaptcha.solver.solveChallenges({
			// 		difficultyBits: challengesRaw.difficultyBits,
			// 		challenges,
			// 		engine: "js",
			// 	});
			// 	console.log("js solutions", solutions);
			// });
			// setDurationJs(durationJs);
		}

		init();
	}, [runBenchmark]);

	return (
		<div>
			<h1>pow-captcha Benchmark</h1>
			<button onClick={() => setRunBenchmark(true)}>run</button>
			Results:
			<table>
				<tr>
					<th>type</th>
					<th>duration</th>
				</tr>
				<tr>
					<td>wasm</td>
					<td>{durationWasm}ms</td>
				</tr>
				<tr>
					<td>js</td>
					<td>{durationJs}ms</td>
				</tr>
			</table>
		</div>
	);
}
