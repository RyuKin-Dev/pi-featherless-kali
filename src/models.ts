

interface ModelClass {
    context_limit: number;
    concurrency_cost: number;
    chars_per_token?: number;
    cost: {
        input: number;
        output: number;
        cacheRead: number;
        cacheWrite: number;
    };
}

const MODEL_CLASSES: Record<string, ModelClass> = {
    "glm4-9b": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen25-7b": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen25-3b": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "glm4-32b": {
        context_limit: 32768,
        concurrency_cost: 2,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "glm47-flash": {
        context_limit: 32768,
        concurrency_cost: 2,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "glm47-357b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "glm51-754b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "glm5-754b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "slf-dstl-1.5b": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "tiny-agent-1.5b": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "minimax-m25": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "kimi-k2": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "kimi-k25": {
        context_limit: 262144,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "deepseek-v3.2": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "deepseek31-685b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "deepseek4-1.6t": {
        context_limit: 262144,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "deepseek4-284b": {
        context_limit: 262144,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "mistral-24b-2503": {
        context_limit: 32768,
        concurrency_cost: 2,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen2-72b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen3-32b": {
        context_limit: 32768,
        concurrency_cost: 2,
        chars_per_token: 3.12,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen3-235b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qwen3-coder-480b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "nemotron3-120b": {
        context_limit: 32768,
        concurrency_cost: 4,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qrwkv-72b-32k": {
        context_limit: 65536,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
    "qrwkv-32b-32k": {
        context_limit: 32768,
        concurrency_cost: 1,
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    },
};

export interface ModelEntry {
    id: string;
    model_class: string;
    reasoning?: boolean;
    tool_use?: boolean;
}

export const DEFAULT_MODEL_ID = "Qwen/Qwen2.5-Coder-7B-Instruct";

export const MODELS: ModelEntry[] = [
    {
        id: "zai-org/GLM-Z1-9B-0414",
        model_class: "glm4-9b",
        tool_use: true,
    },
    {
        id: "Qwen/Qwen2.5-Coder-7B-Instruct",
        model_class: "qwen25-7b",
        tool_use: true,
    },
    {
        id: "Qwen/Qwen2.5-3B-Instruct",
        model_class: "qwen25-3b",
        tool_use: true,
    },
    { id: "zai-org/GLM-4.7-Flash", model_class: "glm47-flash", tool_use: true },
    { id: "RyanYr/slf-dstl_Q2.5-1.5B-It_tooluse_SFT", model_class: "slf-dstl-1.5b", tool_use: true },
    { id: "driaforall/Tiny-Agent-a-1.5B", model_class: "tiny-agent-1.5b", tool_use: true },
    { id: "zai-org/GLM-4.7", model_class: "glm47-357b", tool_use: true },
    { id: "zai-org/GLM-5", model_class: "glm51-754b", tool_use: true },
    { id: "zai-org/GLM-5", model_class: "glm5-754b", tool_use: true },
    {
        id: "MiniMaxAI/MiniMax-M2.5",
        model_class: "minimax-m25",
        tool_use: true,
    },
    {
        id: "moonshotai/Kimi-K2-Instruct",
        model_class: "kimi-k2",
        tool_use: true,
    },
    {
        id: "moonshotai/Kimi-K2-Thinking",
        model_class: "kimi-k2",
        reasoning: true,
        tool_use: true,
    },
    { id: "moonshotai/Kimi-K2.5", model_class: "kimi-k25", tool_use: true },
    { id: "moonshotai/Kimi-K2.6", model_class: "kimi-k25", tool_use: true },
    { id: "moonshotai/Kimi-K2.7-Code", model_class: "kimi-k25", tool_use: true },
    {
        id: "deepseek-ai/DeepSeek-V3.2",
        model_class: "deepseek-v3.2",
        tool_use: true,
    },
    {
        id: "deepseek-ai/DeepSeek-V3.1",
        model_class: "deepseek31-685b",
        tool_use: true,
    },
    {
        id: "deepseek-ai/DeepSeek-V4-Pro",
        model_class: "deepseek4-1.6t",
        tool_use: true,
    },
    {
        id: "deepseek-ai/DeepSeek-V4-Flash",
        model_class: "deepseek4-284b",
        tool_use: true,
    },
    {
        id: "mistralai/Mistral-Small-3.2-24B-Instruct-2506",
        model_class: "mistral-24b-2503",
        tool_use: true,
    },
    {
        id: "llmfan46/Tower-Plus-72B-ultra-uncensored-heretic",
        model_class: "qwen2-72b",
        tool_use: true,
    },
    {
        id: "Qwen/Qwen3-32B",
        model_class: "qwen3-32b",
        reasoning: true,
        tool_use: true,
    },
    {
        id: "Qwen/Qwen3-235B-A22B",
        model_class: "qwen3-235b",
        reasoning: true,
        tool_use: true,
    },
    {
        id: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        model_class: "qwen3-coder-480b",
        reasoning: true,
        tool_use: true,
    },
    {
        id: "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16",
        model_class: "nemotron3-120b",
        tool_use: true,
    },
    {
        id: "recursal/RWKV6Qwen2.5-32B-QwQ-Preview",
        model_class: "qrwkv-32b-32k",
        reasoning: true,
        tool_use: true,
    },
];

export function getModelConfig(entry: ModelEntry) {
    const mc = MODEL_CLASSES[entry.model_class];
    if (!mc) throw new Error(`Unknown model_class: ${entry.model_class}`);

    const reasoning =
        entry.reasoning === undefined
            ? /(?:thinking|qw|reason|r1)/i.test(entry.id)
            : entry.reasoning;

    return {
        id: entry.id,
        name: entry.id,
        reasoning,
        contextWindow: Math.min(mc.context_limit, 36864),
        maxTokens: 36864,
        input: ["text"] as ("text" | "image")[],
        cost: mc.cost,
    };
}

export function getRealContextLimit(modelId: string): number | undefined {
    const entry = MODELS.find((m) => m.id === modelId);
    if (!entry) return undefined;
    const mc = MODEL_CLASSES[entry.model_class];
    if (!mc) return undefined;
    return Math.min(mc.context_limit, 36864);
}

export function getCharsPerToken(modelClass: string): number {
    const mc = MODEL_CLASSES[modelClass];
    return mc?.chars_per_token ?? 3.2;
}

export function getConcurrencyCost(modelClass: string): number {
    const mc = MODEL_CLASSES[modelClass];
    if (!mc) throw new Error(`Unknown model_class: ${modelClass}`);
    return mc.concurrency_cost;
}

export function getModelClass(modelId: string): string | undefined {
    const entry = MODELS.find((m) => m.id === modelId);
    if (entry) return entry.model_class;

    const lower = modelId.toLowerCase();
    if (lower.includes("qrwkv-72b") || lower.includes("qrwkv7b-72b")) {
        return "qrwkv-72b-32k";
    }
    if (lower.includes("qrwkv-32b") || lower.includes("qrwkv7b-32b")) {
        return "qrwkv-32b-32k";
    }
    if (lower.includes("qwen3-32b")) {
        return "qwen3-32b";
    }
    return undefined;
}
