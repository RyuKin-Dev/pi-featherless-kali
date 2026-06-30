#!/usr/bin/env node
import { spawnSync, execSync } from "node:child_process";
import {
    existsSync,
    mkdirSync,
    rmSync,
    readFileSync,
    writeFileSync,
    readdirSync,
    statSync,
} from "node:fs";
import { dirname, join, resolve, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function print(...args) {
    console.log(...args);
}

function printErr(...args) {
    console.error(...args);
}

function exit(code, message) {
    if (message) printErr(message);
    process.exit(code ?? 1);
}

function parseArgs(argv) {
    const args = [];
    const flags = new Set();
    for (const arg of argv) {
        if (arg === "--json" || arg === "--force" || arg === "--yes") {
            flags.add(arg);
        } else {
            args.push(arg);
        }
    }
    return { args, flags };
}

function outputJson(result) {
    print(JSON.stringify(result, null, 2));
}

function runShell(command, flags) {
    const result = spawnSync(command, { shell: true, encoding: "utf8" });
    const payload = {
        command,
        exitCode: result.status ?? 0,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
    };
    if (flags.has("--json")) {
        outputJson(payload);
    } else {
        if (payload.stdout) print(payload.stdout.trimEnd());
        if (payload.stderr) printErr(payload.stderr.trimEnd());
    }
    process.exit(payload.exitCode);
}

function runExec(program, args, flags) {
    const result = spawnSync(program, args, { shell: false, encoding: "utf8" });
    const payload = {
        program,
        args,
        exitCode: result.status ?? 0,
        stdout: result.stdout ?? "",
        stderr: result.stderr ?? "",
    };
    if (flags.has("--json")) {
        outputJson(payload);
    } else {
        if (payload.stdout) print(payload.stdout.trimEnd());
        if (payload.stderr) printErr(payload.stderr.trimEnd());
    }
    process.exit(payload.exitCode);
}

function createFile(filePath, content, flags) {
    const target = resolve(filePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content ?? "", "utf8");
    const payload = { created: target };
    if (flags.has("--json")) outputJson(payload);
    else print(`created: ${target}`);
}

function writeStdin(filePath, flags) {
    const target = resolve(filePath);
    const content = readFileSync(0, "utf8");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, "utf8");
    const payload = { written: target, bytes: Buffer.byteLength(content) };
    if (flags.has("--json")) outputJson(payload);
    else print(`written: ${target}`);
}

function deletePath(targetPath, flags) {
    const target = resolve(targetPath);
    if (!existsSync(target)) {
        const payload = { deleted: target, existed: false };
        if (flags.has("--json")) outputJson(payload);
        else print(`does not exist: ${target}`);
        return;
    }
    const stats = statSync(target);
    const isDir = stats.isDirectory();
    if (isDir && !flags.has("--yes") && !flags.has("--force")) {
        exit(1, `Refusing to delete directory without --yes or --force: ${target}`);
    }
    rmSync(target, { recursive: true, force: true });
    const payload = { deleted: target, wasDirectory: isDir };
    if (flags.has("--json")) outputJson(payload);
    else print(`deleted: ${target}`);
}

function makeDirectory(dirPath, flags) {
    const target = resolve(dirPath);
    mkdirSync(target, { recursive: true });
    const payload = { created: target };
    if (flags.has("--json")) outputJson(payload);
    else print(`created directory: ${target}`);
}

function catFile(filePath, flags) {
    const target = resolve(filePath);
    if (!existsSync(target)) exit(1, `file not found: ${target}`);
    const content = readFileSync(target, "utf8");
    if (flags.has("--json")) outputJson({ file: target, content });
    else print(content);
}

function listDir(dirPath, flags) {
    const target = resolve(dirPath ?? ".");
    if (!existsSync(target)) exit(1, `path not found: ${target}`);
    const entries = readdirSync(target, { withFileTypes: true });
    const items = entries.map((e) => ({
        name: e.name,
        type: e.isDirectory() ? "directory" : e.isFile() ? "file" : "other",
    }));
    if (flags.has("--json")) outputJson({ path: target, entries: items });
    else {
        for (const item of items) {
            print(`${item.type.padEnd(9)} ${item.name}`);
        }
    }
}

function pathExists(targetPath, flags) {
    const target = resolve(targetPath);
    const exists = existsSync(target);
    let type = null;
    if (exists) {
        try {
            const s = statSync(target);
            type = s.isDirectory() ? "directory" : s.isFile() ? "file" : "other";
        } catch {
            type = "unknown";
        }
    }
    const payload = { path: target, exists, type };
    if (flags.has("--json")) outputJson(payload);
    else print(exists ? `${target} exists (${type})` : `${target} does not exist`);
}

function showHelp() {
    print(`kali-sh — run Linux commands and manage files from KaliAI.

Usage: kali-sh <command> [options]

Commands:
  run <command>            Execute a shell command
  exec <program> [args]    Execute a program directly
  create <file> [content]  Create or overwrite a file
  write <file>             Write stdin to a file
  delete <path>            Delete a file or directory
  mkdir <dir>              Create a directory (recursive)
  cat <file>               Print file contents
  ls [path]                List directory entries
  exists <path>            Check if a path exists

Options:
  --json                   Output machine-readable JSON
  --force, --yes           Skip safety prompts for destructive ops

Examples:
  kali-sh run "ls -la"
  kali-sh exec uname -a
  kali-sh create /tmp/hello.txt "hello world"
  echo "data" | kali-sh write /tmp/data.txt
  kali-sh delete /tmp/old --yes
  kali-sh ls /var/log
  kali-sh exists /etc/os-release
`);
}

const argv = process.argv.slice(2);
if (argv.length === 0) {
    showHelp();
    process.exit(0);
}

const command = argv[0];
const { args, flags } = parseArgs(argv.slice(1));

switch (command) {
    case "run":
        if (!args.length) exit(1, "Usage: kali-sh run <command>");
        runShell(args.join(" "), flags);
        break;
    case "exec":
        if (!args.length) exit(1, "Usage: kali-sh exec <program> [args...]");
        runExec(args[0], args.slice(1), flags);
        break;
    case "create":
        if (!args.length) exit(1, "Usage: kali-sh create <file> [content]");
        createFile(args[0], args.slice(1).join(" "), flags);
        break;
    case "write":
        if (!args.length) exit(1, "Usage: kali-sh write <file>");
        writeStdin(args[0], flags);
        break;
    case "delete":
        if (!args.length) exit(1, "Usage: kali-sh delete <path>");
        deletePath(args[0], flags);
        break;
    case "mkdir":
        if (!args.length) exit(1, "Usage: kali-sh mkdir <dir>");
        makeDirectory(args[0], flags);
        break;
    case "cat":
        if (!args.length) exit(1, "Usage: kali-sh cat <file>");
        catFile(args[0], flags);
        break;
    case "ls":
        listDir(args[0], flags);
        break;
    case "exists":
        if (!args.length) exit(1, "Usage: kali-sh exists <path>");
        pathExists(args[0], flags);
        break;
    case "help":
    case "--help":
    case "-h":
        showHelp();
        break;
    default:
        exit(1, `Unknown command: ${command}\nRun "kali-sh help" for usage.`);
}
