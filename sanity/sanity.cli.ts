/**
 * Sanity CLI configuration.
 *
 * Enables `npx sanity <command>` from the repo root (schema deploy, dataset
 * ops, etc). Reads the same env vars as the runtime config so the CLI
 * targets the correct project / dataset.
 */

import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  },
});
