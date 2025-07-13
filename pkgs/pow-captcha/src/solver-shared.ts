export const WORKER_READY = "fa7c33c3-85cb-4bcd-bffb-59a55d8dda31";

export type Challenge = readonly [Uint8Array, Uint8Array];

export type WorkerRequest = {
	engine?: undefined | "js" | "wasm";
	challenges: ReadonlyArray<Challenge>;
};

export type WorkerResponse = {
	solutions: ReadonlyArray<Uint8Array>;
};
