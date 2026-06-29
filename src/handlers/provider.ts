import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { MODELS, getModelConfig } from "../models";
import { BASE_URL, PROVIDER } from "./shared";

export function registerProvider(pi: ExtensionAPI) {
    pi.registerProvider(PROVIDER, {
        name: "Featherless AI",
        baseUrl: BASE_URL,
        apiKey: "$FEATHERLESS_API_KEY",
        api: "openai-completions",
        authHeader: true,
        models: MODELS.map(getModelConfig),
    });
}
