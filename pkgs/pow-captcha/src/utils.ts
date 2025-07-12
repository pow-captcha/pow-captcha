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

export function arrayStartsWith(array: Uint8Array, search: Uint8Array): boolean {
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
