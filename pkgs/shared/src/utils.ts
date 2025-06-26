export function createArray<T>(
	length: number,
	f: (index: number) => T,
): Array<T> {
	return Array.from({ length }, (_, index) => f(index));
}
