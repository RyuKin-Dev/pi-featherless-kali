
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerProvider } from "../src/handlers/provider";
import { registerConcurrencyTracking } from "../src/handlers/concurrency";
import { registerContextTracking } from "../src/handlers/context";
import { registerCompaction } from "../src/handlers/compaction";
import { registerUpdateCheck } from "../src/handlers/update-check";
import { registerWebsearchTools } from "../src/tools/websearch";
import { PROVIDER } from "../src/handlers/shared";
import { DEFAULT_MODEL_ID } from "../src/models";

async function patchDefaultModel() {
    let baseUrl: string;
    try {
        baseUrl = import.meta.resolve("@earendil-works/pi-coding-agent");
    } catch {
        baseUrl = new URL(
            "../node_modules/@earendil-works/pi-coding-agent/dist/index.js",
            import.meta.url,
        ).href;
    }

    const resolverUrl = new URL("./core/model-resolver.js", baseUrl).href;
    try {
        const mod = (await import(resolverUrl)) as {
            defaultModelPerProvider?: Record<string, string>;
        };
        if (mod.defaultModelPerProvider) {
            mod.defaultModelPerProvider[PROVIDER] = DEFAULT_MODEL_ID;
        }
    } catch {
    }
}

export default async function (pi: ExtensionAPI) {
    await patchDefaultModel();
    registerProvider(pi);
    registerConcurrencyTracking(pi);
    registerContextTracking(pi);
    registerCompaction(pi);
    registerUpdateCheck(pi);
    registerWebsearchTools(pi);
}
