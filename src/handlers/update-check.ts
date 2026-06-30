import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PACKAGE_JSON = new URL("../../package.json", import.meta.url);
const CHANGELOG = new URL("../../CHANGELOG.md", import.meta.url);
const AGENT_DIR = `${homedir()}/.pi/agent`;
const LAST_UPDATE_FILE = `${AGENT_DIR}/.kali-ai-last-update`;

interface VersionInfo {
    current: string;
    latest: string | undefined;
    outdated: boolean;
}

function getCurrentVersion(): string {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8"));
    return pkg.version as string;
}

function parseVersion(version: string): number[] {
    return version
        .replace(/^v/, "")
        .split(".")
        .map((part) => parseInt(part, 10));
}

function isNewer(a: string, b: string): boolean {
    const av = parseVersion(a);
    const bv = parseVersion(b);
    const len = Math.max(av.length, bv.length);
    for (let i = 0; i < len; i++) {
        const ai = av[i] ?? 0;
        const bi = bv[i] ?? 0;
        if (ai > bi) return true;
        if (ai < bi) return false;
    }
    return false;
}

async function fetchLatestVersion(): Promise<string | undefined> {
    try {
        const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf8"));
        const name = encodeURIComponent(pkg.name as string);
        const res = await fetch(`https://registry.npmjs.org/${name}/latest`, {
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return undefined;
        const data = await res.json();
        return typeof data.version === "string" ? data.version : undefined;
    } catch {
        return undefined;
    }
}

function readLatestChangelog(): string {
    try {
        const text = readFileSync(CHANGELOG, "utf8");
        const lines = text.split("\n");
        const start = lines.findIndex((l) => l.startsWith("## "));
        if (start === -1) return "Kein Changelog vorhanden.";
        const end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
        return lines
            .slice(start, end === -1 ? undefined : end)
            .join("\n")
            .trim();
    } catch {
        return "Changelog nicht lesbar.";
    }
}

function bannerLines(version: string, lines: string[]): string[] {
    return [
        `KaliAI v${version}`,
        ...lines,
    ];
}

function readLastShownVersion(): string | undefined {
    try {
        if (!existsSync(LAST_UPDATE_FILE)) return undefined;
        const data = JSON.parse(readFileSync(LAST_UPDATE_FILE, "utf8"));
        return typeof data.version === "string" ? data.version : undefined;
    } catch {
        return undefined;
    }
}

function writeLastShownVersion(version: string): void {
    try {
        if (!existsSync(AGENT_DIR)) mkdirSync(AGENT_DIR, { recursive: true });
        writeFileSync(
            LAST_UPDATE_FILE,
            JSON.stringify({ version }, null, 2),
            "utf8",
        );
    } catch {
        // ignore
    }
}

export function registerUpdateCheck(pi: ExtensionAPI) {
    pi.on("session_start", async (_event, ctx) => {
        if (!ctx.ui) return;

        const current = getCurrentVersion();
        const latest = await fetchLatestVersion();
        const outdated = latest ? isNewer(latest, current) : false;

        if (outdated && latest) {
            ctx.ui.setWidget(
                "kali-update-banner",
                bannerLines(current, [
                    `Update verfügbar: v${latest}`,
                    `Installieren mit /update`,
                    `Neuigkeiten mit /whatsnew`,
                ]),
                { placement: "aboveEditor" },
            );
            return;
        }

        const lastShown = readLastShownVersion();
        if (lastShown !== current) {
            writeLastShownVersion(current);
            ctx.ui.setWidget(
                "kali-update-banner",
                bannerLines(current, [
                    "Update installiert.",
                    ...readLatestChangelog().split("\n").slice(0, 12),
                ]),
                { placement: "aboveEditor" },
            );
            setTimeout(() => {
                ctx.ui.setWidget("kali-update-banner", undefined);
            }, 10000);
        }
    });

    pi.registerCommand("update", {
        description: "KaliAI auf die neueste npm-Version aktualisieren.",
        handler: async (_args, ctx) => {
            if (!ctx.ui) return;
            const current = getCurrentVersion();
            const latest = await fetchLatestVersion();
            if (!latest) {
                ctx.ui.notify("Versionsprüfung fehlgeschlagen.", "error");
                return;
            }
            if (!isNewer(latest, current)) {
                ctx.ui.notify(`KaliAI ist aktuell (v${current}).`, "info");
                return;
            }
            const ok = await ctx.ui.confirm(
                "KaliAI aktualisieren",
                `v${current} -> v${latest} installieren?`,
            );
            if (!ok) return;

            ctx.ui.setWorkingMessage("KaliAI wird aktualisiert...");
            const result = await pi.exec(
                "npm",
                ["install", "-g", `@earendil-works/pi-featherless-kali@${latest}`],
                { timeout: 120000 },
            );
            ctx.ui.setWorkingMessage();

            if (result.code !== 0) {
                ctx.ui.notify(
                    `Update fehlgeschlagen: ${result.stderr || result.stdout}`,
                    "error",
                );
                return;
            }

            writeLastShownVersion(latest);
            ctx.ui.setWidget(
                "kali-update-banner",
                bannerLines(latest, [
                    "Update installiert.",
                    "Bitte KaliAI neu starten.",
                    ...readLatestChangelog().split("\n").slice(0, 8),
                ]),
                { placement: "aboveEditor" },
            );
            setTimeout(() => {
                ctx.ui.setWidget("kali-update-banner", undefined);
            }, 10000);
        },
    });

    pi.registerCommand("whatsnew", {
        description: "Zeigt die neuesten KaliAI-Änderungen an.",
        handler: async (_args, ctx) => {
            if (!ctx.ui) return;
            const current = getCurrentVersion();
            const latest = await fetchLatestVersion();
            const title = latest
                ? `KaliAI v${current} (aktuellste npm: v${latest})`
                : `KaliAI v${current}`;
            ctx.ui.setWidget(
                "kali-update-banner",
                [title, "", ...readLatestChangelog().split("\n")],
                { placement: "aboveEditor" },
            );
        },
    });
}
