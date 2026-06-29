---
name: websearch
description: Web search and content extraction. Uses Brave Search API if BRAVE_API_KEY is set, otherwise falls back to DuckDuckGo scraping. Can extract readable article text from any URL via Mozilla Readability. Use when the user asks for current web information, documentation lookup, news, facts, or URL content extraction.
---

# Websearch

## Setup

Run once to install dependencies:

```bash
cd ~/.pi/agent/skills/websearch && npm install
```

## Usage: Search

```bash
# DuckDuckGo fallback (default if no BRAVE_API_KEY)
node search.js "typescript decorator pattern"

# Brave API (set BRAVE_API_KEY env var)
node search.js "latest react server components" --limit 5

# JSON output for piping
node search.js "openai codex" --json --limit 3
```

## Usage: Content Extraction

```bash
# Extract readable article text from any URL
node extract.js "https://example.com/blog-post"

# JSON output
node extract.js "https://example.com" --json
```

## Notes

- Respect robots.txt and rate limits.
- If DuckDuckGo blocks requests, set a BRAVE_API_KEY environment variable.
- extract.js strips ads, navigation and boilerplate to return clean article text.
