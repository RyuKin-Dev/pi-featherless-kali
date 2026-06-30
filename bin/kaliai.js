#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, symlinkSync, cpSync, readFileSync, readdirSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, "..");
const HOME = homedir();
const AGENT_DIR = join(HOME, ".pi", "agent");
const EXT_DIR = join(AGENT_DIR, "extensions", "pi-featherless");
const SKILLS_DIR = join(AGENT_DIR, "skills");
const PI_PACKAGE = "@earendil-works/pi-coding-agent";
const NPM_PACKAGE = "@ryukin-dev/pi-featherless-kali";

function print(...args) {
    console.log(...args);
}

function getGlobalNpmRoot() {
    try {
        return execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    } catch {
        return undefined;
    }
}

function getPiCliPath() {
    const root = getGlobalNpmRoot();
    if (!root) return undefined;
    return join(root, PI_PACKAGE, "dist", "cli.js");
}

function readPackageVersion(dir) {
    try {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        return pkg.version;
    } catch {
        return undefined;
    }
}

function readChangelog(dir) {
    try {
        const text = readFileSync(join(dir, "CHANGELOG.md"), "utf8");
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

function installSkillDeps(skillPath) {
    if (existsSync(join(skillPath, "package.json")) && !existsSync(join(skillPath, "node_modules"))) {
        print(`  Installiere Skill-Abhängigkeiten: ${basename(skillPath)}`);
        spawnSync("npm", ["install"], { cwd: skillPath, stdio: "inherit" });
    }
}

function linkOrCopy(source, target) {
    if (existsSync(target)) rmSync(target, { recursive: true, force: true });
    try {
        symlinkSync(source, target, platform() === "win32" ? "junction" : "dir");
    } catch {
        cpSync(source, target, { recursive: true });
    }
}

function installExtension() {
    print("==> KaliAI Extension wird eingerichtet...");
    if (existsSync(EXT_DIR)) rmSync(EXT_DIR, { recursive: true, force: true });
    cpSync(SOURCE_DIR, EXT_DIR, {
        recursive: true,
        filter: (src) =>
            !src.includes("node_modules") &&
            !src.includes(".git"),
    });

    const skillsSource = join(SOURCE_DIR, "skills");
    if (existsSync(skillsSource)) {
        mkdirSync(SKILLS_DIR, { recursive: true });
        for (const name of readdirSync(skillsSource)) {
            const src = join(skillsSource, name);
            const dst = join(SKILLS_DIR, name);
            linkOrCopy(src, dst);
            installSkillDeps(dst);
        }
    }
    print("==> KaliAI Extension bereit.");
}

async function startChat() {
    installExtension();
    const piCli = getPiCliPath();
    if (!piCli || !existsSync(piCli)) {
        print("Fehler: Pi Coding Agent nicht gefunden.");
        print(`Installiere ihn mit:`);
        print(`  npm install -g ${PI_PACKAGE}`);
        process.exit(1);
    }
    print("==> Starte KaliAI Chat UI...");
    spawnSync(process.execPath, [piCli], { stdio: "inherit" });
}

async function runUpdate() {
    print("==> KaliAI Update wird durchgeführt...");
    const before = readPackageVersion(SOURCE_DIR);
    const result = spawnSync("npm", ["install", "-g", `${NPM_PACKAGE}@latest`], {
        stdio: "inherit",
    });
    if (result.status !== 0) {
        print("Update fehlgeschlagen.");
        process.exit(result.status ?? 1);
    }
    installExtension();
    const after = readPackageVersion(SOURCE_DIR);
    print("==> KaliAI aktualisiert" + (before && after ? `: v${before} -> v${after}` : ""));
    print("");
    print(readChangelog(SOURCE_DIR));
    print("");
    print("Starte KaliAI neu, um die Änderungen zu laden.");
}

function showWhatsNew() {
    print("==> KaliAI Changelog");
    print("");
    print(readChangelog(SOURCE_DIR));
}

const argv = process.argv.slice(2);
const first = argv[0] ?? "";

if (first.toLowerCase() === "update") {
    runUpdate();
} else if (first.toLowerCase() === "whatsnew" || first.toLowerCase() === "changelog") {
    showWhatsNew();
} else {
    startChat();
}
