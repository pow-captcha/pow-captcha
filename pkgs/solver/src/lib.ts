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

function arrayStartsWith(array: Uint8Array, search: Uint8Array): boolean {
	const searchLen = search.length;
	if (searchLen > array.length) {
		return false;
	}
	for (let i = 0; i < searchLen; i += 1) {
		if (array[i] !== search[i]) {
			return false;
		}
	}
	return true;
}
