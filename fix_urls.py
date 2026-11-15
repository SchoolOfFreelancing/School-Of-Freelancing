#!/usr/bin/env python3
"""Normalize internal URLs to the no-trailing-slash form the Worker enforces.

Run from the repo root:  python3 -I fix_urls.py <repo_root>
"""
import os
import re
import sys

root = sys.argv[1]
HOST = r"https://schooloffreelancing\.com"
SEG = r"[A-Za-z0-9_\-]"

# Absolute internal URL ending in a slash (not the bare root, not assets / .well-known).
abs_re = re.compile(
    rf"({HOST}/(?!assets/|\.well-known/)(?:{SEG}+/)*{SEG}+)/(?=[\"'<>\s)\]#?,]|$)"
)
# Root-relative href ending in a slash.
rel_re = re.compile(
    rf"(href=[\"'])(/(?!assets/|\.well-known/)(?:{SEG}+/)*{SEG}+)/(?=[\"'#?])"
)

EXTS = {".html", ".txt", ".xml", ".md"}
SKIP_DIRS = {".git", ".github", "node_modules", "src"}
SKIP_FILES = {"README.md"}

changed_files = 0
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
        new, n1 = abs_re.subn(r"\1", text)
        n2 = 0
        if name.endswith(".html"):
            new, n2 = rel_re.subn(r"\1\2", new)
        if n1 + n2:
            open(path, "w", encoding="utf-8").write(new)
            changed_files += 1
            total += n1 + n2

# Sitemap: swap the 5 legacy URLs (they 301) for their real destinations.
sm_path = os.path.join(root, "sitemap.xml")
sm = open(sm_path, encoding="utf-8").read()
swapped = 0
for slug in ["ai-chatbot", "automation", "docker-containerize", "linux-deployment", "voip-setup"]:
    old = f"https://schooloffreelancing.com/resource-center/{slug}<"
    new = f"https://schooloffreelancing.com/resource-center/guides/{slug}<"
    if old in sm:
        sm = sm.replace(old, new)
        swapped += 1
open(sm_path, "w", encoding="utf-8").write(sm)

print(f"files changed: {changed_files}, URL rewrites: {total}, sitemap swaps: {swapped}")
