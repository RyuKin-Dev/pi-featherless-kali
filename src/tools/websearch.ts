import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { env } from "node:process";

const DEFAULT_LIMIT = 10;

interface SearchResult {
    title: string;
    url: string;
    description: string;
    source: "brave" | "ddg";
}

async function braveSearch(query: string, limit: number): Promise<SearchResult[]> {
    const key = env.BRAVE_API_KEY;
    if (!key) throw new Error("BRAVE_API_KEY not set");

    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(limit));
    url.searchParams.set("offset", "0");

    const resp = await fetch(url, {
        headers: {
            "X-Subscription-Token": key,
            Accept: "application/json",
        },
    });

    if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`Brave API ${resp.status}: ${text}`);
    }

    const data = (await resp.json()) as any;
    return (data.web?.results || []).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        description: r.description || "",
        source: "brave" as const,
    }));
}

async function ddgSearch(query: string, limit: number): Promise<SearchResult[]> {
    const body = new URLSearchParams({ q: query, kl: "en-us" });

    const resp = await fetch("https://html.duckduckgo.com/html/", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        body: body.toString(),
    });

    if (!resp.ok) throw new Error(`DuckDuckGo returned ${resp.status}`);

    const html = await resp.text();
    const { load } = await import("cheerio");
    const $ = load(html);
    const results: SearchResult[] = [];

    $(".result").each((_i, el) => {
        if (results.length >= limit) return false;
        const title = $(el).find(".result__a").text().trim();
        let url = $(el).find(".result__a").attr("href");
        const description = $(el).find(".result__snippet").text().trim();

        if (!title || !url) return;
        if (url.startsWith("//")) url = "https:" + url;
        if (url.startsWith("/")) url = "https://duckduckgo.com" + url;

        results.push({ title, url, description, source: "ddg" });
    });

    return results;
}

async function searchWeb(query: string, limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
    if (env.BRAVE_API_KEY) {
        return braveSearch(query, limit);
    }
    return ddgSearch(query, limit);
}

async function extractUrl(url: string) {
    const resp = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    const html = await resp.text();
    const { JSDOM } = await import("jsdom");
    const { Readability } = await import("@mozilla/readability");
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
        throw new Error("Could not extract readable content from this URL");
    }

    return {
        title: article.title || "",
        byline: article.byline || "",
        excerpt: article.excerpt || "",
        length: article.length || 0,
        textContent: article.textContent || "",
        siteName: article.siteName || "",
    };
}

export function registerWebsearchTools(pi: ExtensionAPI) {
    pi.registerTool(
        defineTool({
            name: "websearch",
            label: "Web Search",
            description:
                "Search the web. Uses Brave Search API if BRAVE_API_KEY is set, otherwise falls back to DuckDuckGo. Returns a list of results with title, URL and description.",
            parameters: Type.Object({
                query: Type.String({ description: "Search query" }),
                limit: Type.Optional(
                    Type.Number({ description: "Maximum number of results (default 10)" }),
                ),
            }),

            async execute(_toolCallId, params) {
                const results = await searchWeb(params.query, params.limit ?? DEFAULT_LIMIT);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(results, null, 2),
                        },
                    ],
                    details: { query: params.query, count: results.length, results },
                };
            },
        }),
    );

    pi.registerTool(
        defineTool({
            name: "websearch_extract",
            label: "Extract Web Page",
            description:
                "Fetch a URL and extract readable article text using Mozilla Readability. Use after websearch to read a specific page in detail.",
            parameters: Type.Object({
                url: Type.String({ description: "URL to fetch and extract" }),
            }),

            async execute(_toolCallId, params) {
                const article = await extractUrl(params.url);
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(article, null, 2),
                        },
                    ],
                    details: { url: params.url, title: article.title },
                };
            },
        }),
    );
}
