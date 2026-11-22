import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/ippan/**/*.test.ts"],
    maxWorkers: 2,
  },
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
});
