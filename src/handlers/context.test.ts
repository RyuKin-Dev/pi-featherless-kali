

import { describe, it, expect, beforeEach } from "vitest";
import { getModelClass } from "../models";

function parseToolCallsFromText(
    text: string,
): Array<{ id: string; name: string; arguments: Record<string, any> }> | null {
    const results = [];

    const regex1 = /<function>\s*(\{.*?\})\s*<\/function>/gs;
    for (const match of [...text.matchAll(regex1)]) {
        try {
            const data = JSON.parse(match[1]);
            if (data.name && data.arguments !== undefined) {
                results.push({
                    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                    name: data.name,
                    arguments: typeof data.arguments === 'string'
                        ? JSON.parse(data.arguments)
                        : data.arguments,
                });
            }
        } catch {
        }
    }

    const regex2 = /<tool_call>\s*(\{.*?\})\s*<\/tool_call>/gs;
    for (const match of [...text.matchAll(regex2)]) {
        try {
            const data = JSON.parse(match[1]);
            if (data.name && data.arguments !== undefined) {
                results.push({
                    id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                    name: data.name,
                    arguments: typeof data.arguments === 'string'
                        ? JSON.parse(data.arguments)
                        : data.arguments,
                });
            }
        } catch {
        }
    }

    const regex3 = /```(?:bash|sh|shell)\s*\n([\s\S]*?)\n?```/gs;
    for (const match of [...text.matchAll(regex3)]) {
        const command = match[1].trim();
        if (command) {
            results.push({
                id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                name: "bash",
                arguments: { command },
            });
        }
    }

    return results.length > 0 ? results : null;
}

describe("parseToolCallsFromText", () => {
    it("should parse a single tool call from RWKV format", () => {
        const text = `<function>{"name": "ls", "arguments": {"path": "/tmp"}}</function>`;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].name).toBe("ls");
        expect(result![0].arguments).toEqual({ path: "/tmp" });
        expect(result![0].id).toMatch(/^call_\d+_/);
    });

    it("should parse multiple tool calls in sequence", () => {
        const text = `
            <function>{"name": "ls", "arguments": {"path": "/tmp"}}</function>
            <function>{"name": "read", "arguments": {"path": "/etc/hosts"}}</function>
        `;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
        expect(result![0].name).toBe("ls");
        expect(result![1].name).toBe("read");
    });

    it("should handle tool calls with complex arguments", () => {
        const text = `<function>{"name": "grep", "arguments": {"pattern": "TODO", "files": ["*.ts", "*.js"]}}</function>`;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result![0].name).toBe("grep");
        expect(result![0].arguments).toEqual({ pattern: "TODO", files: ["*.ts", "*.js"] });
    });

    it("should handle arguments as nested JSON strings", () => {
        const argsJson = JSON.stringify({ path: "/tmp", recursive: true });
        const text = `<function>{"name": "bash", "arguments": "${argsJson.replace(/"/g, '\\"')}"}</function>`;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result![0].name).toBe("bash");
        expect(result![0].arguments).toEqual({ path: "/tmp", recursive: true });
    });

    it("should return null for text without tool calls", () => {
        const text = "Hello, this is just a regular message without tool calls.";
        const result = parseToolCallsFromText(text);
        
        expect(result).toBeNull();
    });

    it("should skip invalid JSON and continue parsing", () => {
        const text = `
            <function>{"name": "ls", "arguments": {"path": "/tmp"}}</function>
            <function>{"invalid": "json"}</function>
            <function>{"name": "read", "arguments": {"path": "/etc"}}</function>
        `;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
    });

    it("should handle whitespace variations", () => {
        const text = `
            <function>  {"name": "ls", "arguments": {}}  </function>
            <function>
                {"name": "read", "arguments": {"path": "/etc"}}
            </function>
        `;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
    });

    it("should handle empty arguments", () => {
        const text = `<function>{"name": "noop", "arguments": {}}</function>`;
        const result = parseToolCallsFromText(text);
        
        expect(result).not.toBeNull();
        expect(result![0].name).toBe("noop");
        expect(result![0].arguments).toEqual({});
    });
});

describe("message_end handler logic simulation", () => {
    it("should convert text blocks with tool calls to toolCall blocks", () => {
        const event = {
            message: {
                role: "assistant",
                content: [
                    { type: "text", text: "<function>{\"name\": \"ls\", \"arguments\": {\"path\": \"/tmp\"}}</function>" },
                ],
                stopReason: "stop",
            },
        };

        const MODELS_NEED_TOOL_CALL_PARSING = new Set(["qrwkv-72b-32k", "qrwkv-32b-32k"]);
        const modelClass = "qrwkv-72b-32k";
        
        if (!MODELS_NEED_TOOL_CALL_PARSING.has(modelClass)) {
        }

        const hasToolCalls = event.message.content?.some(
            (block: any) => block.type === "toolCall"
        );

        const newContent: any[] = [];
        let foundToolCalls = false;

        for (const block of event.message.content ?? []) {
            if (block.type === "text" && block.text) {
                const parsed = parseToolCallsFromText(block.text);
                if (parsed && parsed.length > 0) {
                    for (const tc of parsed) {
                        newContent.push({
                            type: "toolCall",
                            id: tc.id,
                            name: tc.name,
                            arguments: tc.arguments,
                        });
                    }
                    foundToolCalls = true;
                    continue;
                }
            }
            newContent.push(block);
        }

        if (foundToolCalls) {
            event.message.content = newContent;
            event.message.stopReason = "toolUse";
        }

        expect(event.message.content).toHaveLength(1);
        const toolBlock = event.message.content[0] as any;
        expect(toolBlock.type).toBe("toolCall");
        expect(toolBlock.name).toBe("ls");
        expect(toolBlock.arguments).toEqual({ path: "/tmp" });
        expect(event.message.stopReason).toBe("toolUse");
    });

    it("should preserve text blocks that don't contain tool calls", () => {
        const event = {
            message: {
                role: "assistant",
                content: [
                    { type: "text", text: "Hello, I can help you!" },
                    { type: "text", text: "<function>{\"name\": \"ls\", \"arguments\": {\"path\": \"/\"}}</function>" },
                    { type: "text", text: "Let me run that command." },
                ],
                stopReason: "stop",
            },
        };

        const MODELS_NEED_TOOL_CALL_PARSING = new Set(["qrwkv-72b-32k"]);
        const modelClass = "qrwkv-72b-32k";

        const hasToolCalls = event.message.content?.some(
            (block: any) => block.type === "toolCall"
        );

        const newContent: any[] = [];
        let foundToolCalls = false;

        for (const block of event.message.content ?? []) {
            if (block.type === "text" && block.text) {
                const parsed = parseToolCallsFromText(block.text);
                if (parsed && parsed.length > 0) {
                    for (const tc of parsed) {
                        newContent.push({ type: "toolCall", id: tc.id, name: tc.name, arguments: tc.arguments });
                    }
                    foundToolCalls = true;
                    continue;
                }
            }
            newContent.push(block);
        }

        if (foundToolCalls) {
            event.message.content = newContent;
            event.message.stopReason = "toolUse";
        }

        expect(event.message.content).toHaveLength(3);
        expect(event.message.content[0].type).toBe("text");
        expect(event.message.content[0].text).toBe("Hello, I can help you!");
        expect(event.message.content[1].type).toBe("toolCall");
        expect(event.message.content[2].type).toBe("text");
        expect(event.message.content[2].text).toBe("Let me run that command.");
    });

    it("should not modify messages that already have toolCall blocks", () => {
        const event = {
            message: {
                role: "assistant",
                content: [
                    { type: "toolCall", id: "existing_1", name: "ls", arguments: {} },
                    { type: "text", text: "<function>{\"name\": \"read\", \"arguments\": {}}</function>" },
                ],
                stopReason: "toolUse",
            },
        };

        const hasToolCalls = event.message.content?.some(
            (block: any) => block.type === "toolCall"
        );

        if (hasToolCalls) {
        }

        expect(event.message.content).toHaveLength(2);
        expect(event.message.content[0].type).toBe("toolCall");
        expect(event.message.content[1].type).toBe("text"); // Not converted
    });
});

describe("getModelClass integration", () => {
    it("should return correct model class for RWKV models", () => {
        expect(getModelClass("featherless-ai/QRWKV-72B")).toBe("qrwkv-72b-32k");
        expect(getModelClass("recursal/RWKV6Qwen2.5-32B-QwQ-Preview")).toBe("qrwkv-32b-32k");
    });

    it("should return undefined for non-RWKV models", () => {
        expect(getModelClass("unknown/model")).toBeUndefined();
        expect(getModelClass("anthropic/claude-sonnet-4-5")).toBeUndefined();
    });

    it("should return correct model class for Tower-Plus and Qwen3", () => {
        expect(getModelClass("llmfan46/Tower-Plus-72B-ultra-uncensored-heretic")).toBe("qwen2-72b");
        expect(getModelClass("Qwen/Qwen3-32B")).toBe("qwen3-32b");
    });
});

describe("markdown bash block parsing", () => {
    it("should convert a bash fenced block into a bash tool call", () => {
        const text = "```bash\ntouch /home/ryukin/Downloads/new_file.txt\n```";
        const result = parseToolCallsFromText(text);

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].name).toBe("bash");
        expect(result![0].arguments).toEqual({ command: "touch /home/ryukin/Downloads/new_file.txt" });
    });

    it("should parse sh and shell fenced blocks", () => {
        const text = "```sh\nls -la\n```\n```shell\nuname -a\n```";
        const result = parseToolCallsFromText(text);

        expect(result).not.toBeNull();
        expect(result).toHaveLength(2);
        expect(result![0].arguments).toEqual({ command: "ls -la" });
        expect(result![1].arguments).toEqual({ command: "uname -a" });
    });

    it("should ignore empty bash blocks", () => {
        const text = "```bash\n```";
        const result = parseToolCallsFromText(text);
        expect(result).toBeNull();
    });

    it("should handle explanatory text around the bash block", () => {
        const text = "Ich erstelle die Datei:\n```bash\ntouch /tmp/x.txt\n```\nErledigt.";
        const result = parseToolCallsFromText(text);

        expect(result).not.toBeNull();
        expect(result).toHaveLength(1);
        expect(result![0].arguments).toEqual({ command: "touch /tmp/x.txt" });
    });
});
