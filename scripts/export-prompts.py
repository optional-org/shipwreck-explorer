#!/usr/bin/env python3
"""Keeps your private prompt log up to date: every prompt you typed to an AI assistant for this project, word for word.

Both files it writes are gitignored: they stay on your machine. They are the raw material for the committed
decision log, docs/DECISIONS.md, which records the reasoning without quoting anyone (see AGENTS.md).

    python3 scripts/export-prompts.py          add new prompts from this machine's assistant histories
    python3 scripts/export-prompts.py --add    add one prompt, read from standard input (for any other assistant)

Histories read automatically, for sessions started in this repository:
    Claude Code   ~/.claude/projects/<project path with dashes>/*.jsonl
    Codex         ~/.codex/sessions/**/*.jsonl
Only what the person typed is kept: no tool output, no system notices, no messages from helper agents. Prompts
already in the log are never removed or changed.

Files written:
    docs/prompts.jsonl   the log itself, one prompt per line (time, session, author, assistant, text). Append only.
    docs/PROMPTS.md      the same log, readable. Generated from the .jsonl: do not edit it by hand.
"""
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CLAUDE_DIR = Path.home() / ".claude" / "projects" / str(ROOT).replace("/", "-")
CODEX_DIR = Path.home() / ".codex" / "sessions"
STORE = ROOT / "docs" / "prompts.jsonl"
OUT = ROOT / "docs" / "PROMPTS.md"

# things that arrive as "user" turns but were not typed by the person
NOT_TYPED = ("<task-notification", "[SYSTEM NOTIFICATION", "Another Claude session sent a message",
             "<system-reminder", "<local-command", "<command-name", "Caveat:", "[Request interrupted")


def typed_text(entry):
    """The text the person typed in this transcript entry, or None."""
    if entry.get("type") != "user" or entry.get("isMeta") or entry.get("isSidechain"):
        return None
    content = entry.get("message", {}).get("content")
    if isinstance(content, list):
        if any(block.get("type") == "tool_result" for block in content):
            return None
        content = "\n".join(block.get("text", "") for block in content if block.get("type") == "text")
    if not isinstance(content, str):
        return None
    content = re.sub(r"<system-reminder.*?</system-reminder>", "", content, flags=re.S).strip()
    if not content or content.startswith(NOT_TYPED):
        return None
    return content


def author():
    """Who is running this: the git user name, so each contributor's prompts are attributed."""
    try:
        name = subprocess.run(["git", "-C", str(ROOT), "config", "user.name"], capture_output=True, text=True).stdout.strip()
    except OSError:
        name = ""
    return name or "unknown"


def read_jsonl(path):
    for line in path.open():
        try:
            yield json.loads(line)
        except json.JSONDecodeError:
            continue


def claude_prompts(who):
    for path in sorted(CLAUDE_DIR.glob("*.jsonl")) if CLAUDE_DIR.is_dir() else []:
        for entry in read_jsonl(path):
            text = typed_text(entry)
            if text:
                yield {"time": entry.get("timestamp", ""), "session": path.stem[:8], "author": who, "assistant": "Claude Code", "text": text}


def codex_prompts(who):
    """Codex keeps every project's sessions together; a session belongs here if it was started inside the repository."""
    for path in sorted(CODEX_DIR.rglob("*.jsonl")) if CODEX_DIR.is_dir() else []:
        here, sid = False, path.stem[-8:]
        for entry in read_jsonl(path):
            payload = entry.get("payload") or {}
            if entry.get("type") == "session_meta":
                cwd = Path(str(payload.get("cwd", "")))
                here = cwd == ROOT or ROOT in cwd.parents
                sid = str(payload.get("id") or payload.get("session_id") or sid)[:8]
            elif here and entry.get("type") == "response_item" and payload.get("type") == "message" and payload.get("role") == "user":
                text = "\n".join(b.get("text", "") for b in payload.get("content") or [] if b.get("type") == "input_text").strip()
                # Codex also files its own context under the user's name: environment blocks and the AGENTS.md text
                if text and not text.startswith(("<", "# AGENTS.md")):
                    yield {"time": entry.get("timestamp", ""), "session": sid, "author": who, "assistant": "Codex", "text": text}


def local_prompts(who):
    yield from claude_prompts(who)
    yield from codex_prompts(who)


def render(log):
    lines = [
        "# Prompt log",
        "",
        "Every prompt typed to Claude Code while building this project, word for word (typos included), oldest first.",
        "Private: this file is gitignored and must not be committed or shared. Claude's replies and tool output are not",
        "included. It is the raw material for the committed decision log, `DECISIONS.md`.",
        "",
        "This file is generated from `prompts.jsonl`: run `python3 scripts/export-prompts.py` to refresh it. Do not edit",
        "it by hand.",
        "",
    ]
    session = None
    for p in log:
        if p["session"] != session:
            session = p["session"]
            lines += [f"## Session `{session}` ({p['author']}, {p.get('assistant', 'Claude Code')})", ""]
        try:
            when = datetime.fromisoformat(p["time"].replace("Z", "+00:00")).astimezone(timezone.utc).strftime("%-d %b %Y, %H:%M UTC")
        except ValueError:
            when = p["time"] or "time not recorded"
        lines += [f"### {when}", ""] + [f"> {row}" if row else ">" for row in p["text"].split("\n")] + [""]
    return "\n".join(lines)


def main():
    log = [json.loads(line) for line in STORE.read_text().splitlines() if line.strip()] if STORE.exists() else []
    if "--add" in sys.argv:
        # one prompt from standard input, for assistants whose history this script cannot read
        text = sys.stdin.read().strip()
        if not text:
            sys.exit("Nothing on standard input.")
        now = datetime.now(timezone.utc)
        new = [{"time": now.isoformat(timespec="milliseconds").replace("+00:00", "Z"), "session": now.strftime("%Y%m%d"), "author": author(), "assistant": "other", "text": text}]
    else:
        seen = {(p["session"], p["time"]) for p in log}
        new = [p for p in local_prompts(author()) if (p["session"], p["time"]) not in seen]
    log = sorted(log + new, key=lambda p: (p["time"], p["session"]))
    STORE.write_text("".join(json.dumps(p, ensure_ascii=False) + "\n" for p in log))
    OUT.write_text(render(log))
    print(f"{len(new)} new, {len(log)} in the log ({OUT.relative_to(ROOT)})")
    if not new and "--add" not in sys.argv:
        print("Nothing new found in the Claude Code or Codex histories on this machine. If you used another assistant, "
              "add each prompt with: python3 scripts/export-prompts.py --add  (text on standard input)", file=sys.stderr)


if __name__ == "__main__":
    main()
