

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const TOKENIZE_URL = "https://api.featherless.ai/v1/tokenize";

const tokenCache = new Map<string, number>();

const MAX_CACHE_SIZE = 10000;

function cacheKey(model: string, text: string): string {
    return `${model}:${text}`;
}

export async function tokenize(
    model: string,
    text: string,
    apiKey?: string,
): Promise<number> {
    // Check cache first
    const key = cacheKey(model, text);
    const cached = tokenCache.get(key);
    if (cached !== undefined) {
        return cached;
    }

    // Make API request
    const response = await fetch(TOKENIZE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ model, text }),
    });

    if (!response.ok) {
        // Fall back to estimation on error
        const body = await response.text().catch(() => "unknown");
        console.warn(
            `Tokenize API error: ${response.status} ${response.statusText}`,
            body,
        );
        return estimateTokens(text);
    }

    const data = (await response.json()) as {
        count?: number;
        tokens?: number[];
    };

    // API returns either {count: number} or {tokens: number[]}
    const count = data.count ?? data.tokens?.length ?? 0;

    // Cache the result (with LRU eviction)
    if (tokenCache.size >= MAX_CACHE_SIZE) {
        // Delete oldest entries (first 10%)
        const keysToDelete = Array.from(tokenCache.keys()).slice(
            0,
            Math.floor(MAX_CACHE_SIZE * 0.1),
        );
        for (const k of keysToDelete) {
            tokenCache.delete(k);
        }
    }
    tokenCache.set(key, count);

    return count;
}

export async function tokenizeBatch(
    model: string,
    texts: string[],
    apiKey?: string,
): Promise<number[]> {
    // Check cache for each text
    const results: number[] = new Array(texts.length);
    const uncached: { index: number; text: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
        const key = cacheKey(model, texts[i]);
        const cached = tokenCache.get(key);
        if (cached !== undefined) {
            results[i] = cached;
        } else {
            uncached.push({ index: i, text: texts[i] });
        }
    }

    // If all cached, return early
    if (uncached.length === 0) {
        return results;
    }

    // Fetch uncached texts in parallel
    await Promise.all(
        uncached.map(async ({ index, text }) => {
            try {
                results[index] = await tokenize(model, text, apiKey);
            } catch {
                // Fall back to estimation
                results[index] = estimateTokens(text);
            }
        }),
    );

    return results;
}

export function estimateTokens(
    text: string,
    defaultCharsPerToken = 3.2,
): number {
    const chars = text.length;
    if (chars === 0) return 0;

    // Detect bash output by looking for file permission patterns
    // Lines like: "drwxr-xr-x  2 kit kit  4096 Apr  5 10:23 ."
    // or: "-rw-r--r--  1 kit kit 12345 Apr  5 10:22 index.ts"
    const lines = text.split("\n");
    const permissionPattern = /^[d-][rwx-]{9}\s/;
    const matchingLines = lines.filter((line) => permissionPattern.test(line));

    // If more than half the lines look like file listings, treat as bash output
    if (
        matchingLines.length > 0 &&
        matchingLines.length >= lines.length * 0.5
    ) {
        return Math.ceil(chars / 1.8);
    }

    return Math.ceil(chars / defaultCharsPerToken);
}

export function extractText(message: any): string {
    switch (message.role) {
        case "user": {
            const content = message.content;
            if (typeof content === "string") {
                return content;
            }
            if (Array.isArray(content)) {
                return content
                    .filter((block: any) => block.type === "text")
                    .map((block: any) => block.text || "")
                    .join("");
            }
            return "";
        }
        case "assistant": {
            const parts: string[] = [];
            for (const block of message.content || []) {
                if (block.type === "text") {
                    parts.push(block.text || "");
                } else if (block.type === "toolCall") {
                    parts.push(block.name || "");
                    parts.push(JSON.stringify(block.arguments || {}));
                }
            }
            return parts.join("");
        }
        case "toolResult": {
            const content = message.content;
            if (typeof content === "string") {
                return content;
            }
            if (Array.isArray(content)) {
                return content
                    .filter((block: any) => block.type === "text")
                    .map((block: any) => block.text || "")
                    .join("");
            }
            return "";
        }
        default:
            return "";
    }
}

export async function countMessageTokens(
    model: string,
    message: any,
    apiKey?: string,
): Promise<number> {
    const text = extractText(message);
    if (!text) return 0;
    return tokenize(model, text, apiKey);
}

export async function countMessagesTokens(
    model: string,
    messages: any[],
    apiKey?: string,
): Promise<number> {
    const counts = await tokenizeBatch(
        model,
        messages.map(extractText),
        apiKey,
    );
    return counts.reduce((sum, n) => sum + n, 0);
}

export function clearTokenCache(): void {
    tokenCache.clear();
}

export function getCacheStats(): { size: number; maxSize: number } {
    return {
        size: tokenCache.size,
        maxSize: MAX_CACHE_SIZE,
    };
}
