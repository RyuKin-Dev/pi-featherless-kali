

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerProvider } from "../src/handlers/provider";
import { registerConcurrencyTracking } from "../src/handlers/concurrency";
import { registerContextTracking } from "../src/handlers/context";
import { registerCompaction } from "../src/handlers/compaction";

export default function (pi: ExtensionAPI) {
    registerProvider(pi);
    registerConcurrencyTracking(pi);
    registerContextTracking(pi);
    registerCompaction(pi);
}
