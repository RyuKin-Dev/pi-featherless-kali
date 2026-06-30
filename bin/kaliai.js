#!/usr/bin/env node
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, readdirSync, readlinkSync, readFileSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = join(__dirname, "..");
const HOME = homedir();
const AGENT_DIR = join(HOME, ".pi", "agent");
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

function ensurePiAgentInstalled() {
    const piCli = getPiCliPath();
    if (piCli && existsSync(piCli)) return piCli;
    print("==> Pi Coding Agent wird installiert...");
    const result = spawnSync("npm", ["install", "-g", PI_PACKAGE], {
        stdio: "inherit",
    });
    if (result.status !== 0) {
        print("Fehler: Pi Coding Agent konnte nicht installiert werden.");
        process.exit(1);
    }
    const fresh = getPiCliPath();
    if (!fresh || !existsSync(fresh)) {
        print("Fehler: Pi Coding Agent nicht auffindbar nach der Installation.");
        process.exit(1);
    }
    return fresh;
}

function removeLegacyCopy() {
    const legacyExt = join(AGENT_DIR, "extensions", "pi-featherless");
    if (existsSync(legacyExt)) {
        print("==> Entferne alte manuelle Extension...");
        rmSync(legacyExt, { recursive: true, force: true });
    }

    const skillsDir = join(AGENT_DIR, "skills");
    if (!existsSync(skillsDir)) return;
    for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
        if (!entry.isSymbolicLink()) continue;
        const target = readlinkSync(join(skillsDir, entry.name));
        if (target.includes("pi-featherless-kali")) {
            rmSync(join(skillsDir, entry.name), { recursive: true, force: true });
        }
    }
}

function installPiPackage() {
    print("==> Installiere KaliAI als Pi-Paket...");
    const piCli = getPiCliPath();
    const result = spawnSync(process.execPath, [piCli, "install", `npm:${NPM_PACKAGE}`], {
        stdio: "inherit",
    });
    if (result.status !== 0) {
        print("Fehler: KaliAI Pi-Paket konnte nicht installiert werden.");
        process.exit(1);
    }
}

function getInstalledPiPackageDir() {
    const scoped = join(AGENT_DIR, "npm", NPM_PACKAGE);
    if (existsSync(scoped)) return scoped;
    return undefined;
}

function installSkillDeps(skillPath) {
    if (existsSync(join(skillPath, "package.json")) && !existsSync(join(skillPath, "node_modules"))) {
        print(`  Installiere Skill-Abhängigkeiten: ${basename(skillPath)}`);
        spawnSync("npm", ["install"], { cwd: skillPath, stdio: "inherit" });
    }
}

function installPiPackageSkillDeps() {
    const pkgDir = getInstalledPiPackageDir();
    if (!pkgDir) return;
    const skillsDir = join(pkgDir, "skills");
    if (!existsSync(skillsDir)) return;
    for (const name of readdirSync(skillsDir)) {
        installSkillDeps(join(skillsDir, name));
    }
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

async function startChat() {
    const piCli = ensurePiAgentInstalled();
    removeLegacyCopy();
    installPiPackage();
    installPiPackageSkillDeps();
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
    const piCli = ensurePiAgentInstalled();
    removeLegacyCopy();
    installPiPackage();
    installPiPackageSkillDeps();
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
