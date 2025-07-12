export function createArray<T>(
	length: number,
	f: (index: number) => T,
): Array<T> {
	return Array.from({ length }, (_, index) => f(index));
}

export function byteArraysEqual(arr1: Uint8Array, arr2: Uint8Array): boolean {
	const len = arr1.length;
	if (len !== arr2.length) {
		return false;
	}
	for (let i = 0; i < len; i += 1) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}
	return true;
}

export function arrayStartsWith(
	array: Uint8Array,
	search: Uint8Array,
): boolean {
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

export function chunkArray<T>(
	chunkSize: number,
	input: ReadonlyArray<T>,
): Array<Array<T>> {
	const chunks: Array<Array<T>> = [];
	for (let i = 0; i < input.length; i += chunkSize) {
		const chunk = input.slice(i, i + chunkSize);
		chunks.push(chunk);
	}
	return chunks;
}

// export function distributeArray<T>(
// 	numBuckets: number,
// 	input: ReadonlyArray<T>,
// ): Array<Array<T>> {
// 	// input.length / numBuckets
// 	const chunkSize = Math.ceil();



// 	return createArray(numBuckets, (bucket): Array<T> => {
// 		const start = bucket * chunkSize;
// 		return input.slice(start, start + chunkSize);
// 	});
// 	// for (let i = 0; i < input.length; i += 1) {
// 	// 	const bucketIndex = Math.floor(i / (input.length / numBuckets));
// 	// 	distributed[bucketIndex]!.push(input[i]!);
// 	// }
// 	// return distributed;
// }
