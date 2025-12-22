import { defineConfig, type LibraryFormats } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const buildMode = process.env.BUILD_MODE || "cli-app";

const libBuildConfig = {
    outDir: "dist/lib",
    lib: {
        entry: resolve(__dirname, "src/index.ts"),
        formats: ["es"] as LibraryFormats[],
        fileName: "index",
    },
    rollupOptions: {
        external: ["react", "react-dom", "react/jsx-runtime"],
        output: {
            globals: {
                "react": "React",
                "react-dom": "ReactDOM",
            },
        },
    },
};

const appBuildConfig = {
    outDir: "dist/app",
    rollupOptions: {
        input: resolve(__dirname, "index.html"),
    },
};

const appCliBuildConfig = {
    outDir: "bin",
    ssr: true,
    lib: {
        entry: resolve(__dirname, "src/cli.ts"),
        formats: ["es"] as LibraryFormats[],
        fileName: () => "cli.js",
    },
    rollupOptions: {
        external: [/^node:/, "yargs", "yargs/helpers", "sirv"],
        output: {
            banner: "#!/usr/bin/env node",
        },
    },
};

function getBuildConfig() {

    if (buildMode === "cli") return appCliBuildConfig;

    if (buildMode === "cli-app") return appBuildConfig;

    return libBuildConfig;
}

export default defineConfig({
    plugins: [react(), buildMode === "lib" && dts()].filter(Boolean),
    server: {
        port: 3000,
        host: true,
        strictPort: true,
    },
    build: getBuildConfig(),
});
