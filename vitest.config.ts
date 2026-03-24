import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
    test: {
        watch: false,
        isolate: false,
        exclude: defaultExclude.concat([
            "**/dist/**",
        ]),
    },
});