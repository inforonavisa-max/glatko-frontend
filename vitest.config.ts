import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Unit-test runner for pure logic (H4 availability engine et al). Next/Jest are not
 * involved. `server-only` is aliased to an empty stub so modules that carry the
 * spec-mandated `import "server-only"` marker (e.g. lib/saglik/availability.ts) still
 * import cleanly under Node/vitest — the marker only guards against client bundling,
 * and the engine itself holds no secrets.
 */
export default defineConfig({
  // G-VOICE-1: component tests (test/voice-tabs.test.ts) import .tsx and need
  // JSX transformed (the project tsconfig sets jsx:"preserve" for Next).
  // @vitejs/plugin-react handles that transform. Additive only — the pure-logic
  // .ts tests carry no JSX so this is a no-op for them; the default env stays
  // "node" and component tests opt into jsdom per-file via a docblock.
  plugins: [react()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "test/stubs/server-only.ts"),
      "@": path.resolve(__dirname),
    },
  },
  test: {
    include: ["lib/**/*.test.ts", "test/**/*.test.ts"],
    environment: "node",
  },
});
