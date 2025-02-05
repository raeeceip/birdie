import { app } from "@orange-js/orange/server";
import * as serverBuild from "virtual:orange/server-bundle";

export * from "virtual:orange/entrypoints";

const server = app(serverBuild);

export default {
  async fetch(request: Request, env: Env) {
    return server.fetch(request, {
      cloudflare: {
        env: {
          ...env,
          // Ensure the DurableObject namespace is available
          LlamaCoordinator: env.LLAMA_COORDINATOR
        }
      }
    });
  }
};