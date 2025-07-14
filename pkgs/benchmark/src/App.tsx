import * as powCaptcha from "@pow-captcha/pow-captcha";
import { useCallback, useEffect, useState } from "react";

async function benchmark(cb: () => void | Promise<void>): Promise<number> {
	const start = performance.now();
	await cb();
	const end = performance.now();
	return end - start;
}

export default function App() {
	const [challenge, setChallenge] =
		useState<null | powCaptcha.wire.Challenge>(null);

	const [durationJs, setDurationJs] = useState<null | string>(null);
	const [durationWasm, setDurationWasm] = useState<null | string>(null);

	useEffect(() => {
		async function init() {
			const challengesRaw = await powCaptcha.server.createChallengesRaw({
				difficultyBits: 19,
				challengeCount: 64,
			});
			setChallenge(challengesRaw);
		}
		init();
	}, []);

	const run = useCallback(
		async (
			engine: "wasm" | "js",
			setter: React.Dispatch<React.SetStateAction<string | null>>,
		) => {
			try {
				if (!challenge) {
					return;
				}

				setter(`Running`);

				const challenges = challenge.challenges.map(
					(challenge) =>
						[
							powCaptcha.wire.deserializeArray(challenge[0]),
							powCaptcha.wire.deserializeArray(challenge[1]),
						] as const,
				);

				const duration = await benchmark(async () => {
					await powCaptcha.solver.solveChallenges({
						difficultyBits: challenge.difficultyBits,
						challenges,
						engine,
					});
				});

				setter(`${duration.toFixed(1)}ms`);
			} catch (err) {
				setter(`Error: ${err}`);
			}
		},
		[challenge],
	);

	const runJs = useCallback(async () => {
		await run("js", setDurationJs);
	}, [run]);

	const runWasm = useCallback(async () => {
		await run("wasm", setDurationWasm);
	}, [run]);

	return (
		<div>
			<h1>pow-captcha Benchmark</h1>
			Results:
			<table>
				<tr>
					<th>type</th>
					<th>duration</th>
					<th></th>
				</tr>
				<tr>
					<td>wasm</td>
					<td>{durationWasm}</td>
					<td>
						<button onClick={runWasm}>run</button>
					</td>
				</tr>
				<tr>
					<td>js</td>
					<td>{durationJs}</td>
					<td>
						<button onClick={runJs}>run</button>
					</td>
				</tr>
			</table>
		</div>
	);
}
