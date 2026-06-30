

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerProvider } from "../src/handlers/provider";
import { registerConcurrencyTracking } from "../src/handlers/concurrency";
import { registerContextTracking } from "../src/handlers/context";
import { registerCompaction } from "../src/handlers/compaction";
import { registerUpdateCheck } from "../src/handlers/update-check";

export default function (pi: ExtensionAPI) {
    registerProvider(pi);
    registerConcurrencyTracking(pi);
    registerContextTracking(pi);
    registerCompaction(pi);
    registerUpdateCheck(pi);
}
