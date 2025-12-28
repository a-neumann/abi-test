import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    root: "app",
    build: {
        outDir: "../dist/app",
        emptyOutDir: true,
    },
    plugins: [react()],
    server: {
        port: 3000,
        host: true,
        strictPort: true,
    },
});
