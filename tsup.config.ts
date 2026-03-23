import { defineConfig } from "tsup";
import { dependencies } from "./package.json";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs"],
	target: "node25",
	outDir: "dist",
	clean: true,
	minify: true,
	sourcemap: true,
	splitting: false,
	bundle: true,
	noExternal: Object.keys(dependencies),
});
