import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

const plugins: Array<PluginOption> = [react(), wasm(), topLevelAwait()];

// https://vite.dev/config/
export default defineConfig({
	plugins,
	worker: {
		format: "es",
		plugins: () => plugins,
	},
});
