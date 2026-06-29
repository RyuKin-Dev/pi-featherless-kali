import type { Context } from "@earendil-works/pi-ai";
import { completeSimple } from "@earendil-works/pi-ai/compat";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { convertToLlm } from "@earendil-works/pi-coding-agent";
import { PROVIDER, getApiKey } from "./shared";

const SUMMARY_PROMPT = `Summarize the conversation so far. Focus on:
- Files read/modified and key findings
- Errors encountered and resolutions
- Decisions made and reasoning
- Current task state and next steps

Be concise but preserve essential context for continuing the work.`;

export function registerCompaction(pi: ExtensionAPI) {
    pi.on("session_before_compact", async (event, ctx) => {
        const model = ctx.model;
        if (!model || model.provider !== PROVIDER) return;

        const apiKey = await getApiKey(ctx);
        if (!apiKey) return;

        const { preparation, signal } = event;
        const {
            messagesToSummarize,
            turnPrefixMessages,
            tokensBefore,
            firstKeptEntryId,
            previousSummary,
        } = preparation;

        const llmMessages = convertToLlm([...messagesToSummarize, ...turnPrefixMessages]);
        
        const messages: Context["messages"] = [
            ...llmMessages,
            {
                role: "user" as const,
                content: [{ type: "text" as const, text: SUMMARY_PROMPT }],
                timestamp: Date.now(),
            },
        ];

        try {
            const result = await completeSimple(
                model,
                { messages },
                { apiKey, maxTokens: 2048, signal },
            );

            const summaryText = result.content
                .filter((c: any) => c.type === "text")
                .map((c: any) => c.text)
                .join("\n");

            if (!summaryText.trim()) return;

            const summary = previousSummary
                ? `## Previous Context\n${previousSummary}\n\n## Recent Activity\n${summaryText}`
                : summaryText;

            return { compaction: { summary, firstKeptEntryId, tokensBefore } };
        } catch {
            return;
        }
    });
}
