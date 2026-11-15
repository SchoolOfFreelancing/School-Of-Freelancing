#!/usr/bin/env python3
"""Point internal links straight at final URLs instead of Worker-redirected legacy URLs.

Run from the repo root:  python3 -I fix_hops.py <repo_root>
Maps are copied from the deployed Worker's SERVICE_MAP / LEGACY_REDIRECTS.
"""
import os
import re
import sys

root = sys.argv[1]
HOST = "https://schooloffreelancing.com"

SERVICE = {
    "linux-server-services": "linux-server-support",
    "ubuntu-linux-services": "ubuntu-linux-support",
    "odysseus-ai-services": "odysseus-ai-setup",
    "goautodial-voip-services": "goautodial-voip-setup",
    "telnyx-sip-trunking-services": "telnyx-voip-setup",
    "hummingbot-installation-services": "hummingbot-installation-support",
    "digitalocean-cloud-services": "digitalocean-cloud-support",
    "vapi-platform-services": "voice-ai-agent-setup",
}
PATH_MAP = {f"/client-support/{k}": f"/client-support/{v}" for k, v in SERVICE.items()}
for s in ["ai-chatbot", "automation", "docker-containerize", "linux-deployment", "voip-setup"]:
    PATH_MAP[f"/resource-center/{s}"] = f"/resource-center/guides/{s}"


def target_exists(p):
    q = p.strip("/")
    return os.path.isfile(os.path.join(root, q, "index.html")) or os.path.isfile(os.path.join(root, q + ".html"))


PATH_MAP = {a: b for a, b in PATH_MAP.items() if target_exists(b)}
# Longest-first, exact-path match only (followed by a quote, #, ?, whitespace, < or end).
alts = "|".join(re.escape(p) for p in sorted(PATH_MAP, key=len, reverse=True))
end = r"(?=[\"'#?<>\s)\],]|$)"
rel_re = re.compile(rf"(href=[\"'])({alts}){end}")
abs_re = re.compile(rf"({re.escape(HOST)})({alts}){end}")

EXTS = {".html", ".txt", ".xml", ".md"}
SKIP_DIRS = {".git", ".github", "node_modules", "src"}
SKIP_FILES = {"README.md"}
files = 0
total = 0
for dirpath, dirnames, filenames in os.walk(root):
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for name in filenames:
        if name in SKIP_FILES or os.path.splitext(name)[1].lower() not in EXTS:
            continue
        path = os.path.join(dirpath, name)
        try:
            text = open(path, encoding="utf-8").read()
        except UnicodeDecodeError:
            continue
        new, n1 = abs_re.subn(lambda m: m.group(1) + PATH_MAP[m.group(2)], text)
        new, n2 = rel_re.subn(lambda m: m.group(1) + PATH_MAP[m.group(2)], new)
        if n1 + n2:
            open(path, "w", encoding="utf-8").write(new)
            files += 1
            total += n1 + n2
print(f"files changed: {files}, links repointed: {total}, mappings active: {len(PATH_MAP)}")
