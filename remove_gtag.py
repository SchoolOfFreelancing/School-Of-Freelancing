#!/usr/bin/env python3
"""
Remove all gtag.js (Google Analytics 4) tracking code from HTML files,
while preserving GTM (Google Tag Manager) snippets.
"""

import re
import sys
from pathlib import Path

def remove_gtag_from_file(filepath):
    """Remove gtag.js blocks from a single HTML file."""
    content = filepath.read_text(encoding='utf-8')
    original = content

    # Pattern 1: Full deferred gtag.js block with comment
    # Starts with <!-- Google tag (gtag.js) --> and ends with </script> before next HTML element
    pattern1 = re.compile(
        r'\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*\n'
        r'\s*<script>\s*\n'
        r'\s*window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];\s*\n'
        r'\s*function\s+gtag\(\)\s*\{\s*window\.dataLayer\.push\(arguments\);\s*\}\s*\n'
        r'\s*gtag\(\'js\',\s*new\s+Date\(\)\);\s*\n'
        r'\s*gtag\(\'config\',\s*\'G-[A-Z0-9]+\'\);\s*\n'
        r'\s*//\s*Defer\s+the\s+~169KB\s+gtag\.js\s+payload\s+until\s+the\s+user\s+actually\s+interacts.*?'
        r'\s*\}\(\)\);\s*\n'
        r'\s*</script>\s*',
        re.DOTALL
    )
    content = pattern1.sub('', content)

    # Pattern 2: Inline gtag.js - two script tags (async src + config)
    # <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
    # <script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-XXXXXXXX');</script>
    pattern2 = re.compile(
        r'\s*<script\s+async\s+src="https://www\.googletagmanager\.com/gtag/js\?id=G-[A-Z0-9]+"></script>\s*\n'
        r'\s*<script>window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];function\s+gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\(\'js\',\s*new\s+Date\(\)\);gtag\(\'config\',\s*\'G-[A-Z0-9]+\'\);</script>\s*',
        re.DOTALL
    )
    content = pattern2.sub('', content)

    # Pattern 3: Just the inline gtag config script (without async src line)
    # This appears in some files after the GTM script
    pattern3 = re.compile(
        r'\s*<script>window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\];function\s+gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\(\'js\',\s*new\s+Date\(\)\);gtag\(\'config\',\s*\'G-[A-Z0-9]+\'\);</script>\s*',
        re.DOTALL
    )
    content = pattern3.sub('', content)

    # Pattern 4: Deferred gtag block but with slightly different formatting
    # More flexible version for edge cases
    pattern4 = re.compile(
        r'\s*<!--\s*Google tag \(gtag\.js\)\s*-->\s*'
        r'(?:\s*\n)?'
        r'\s*<script>.*?'
        r'gtag\([\'"]config[\'"]\s*,\s*[\'"]G-[A-Z0-9]+[\'"]\).*?'
        r'</script>\s*',
        re.DOTALL
    )
    content = pattern4.sub('', content)

    # Clean up any resulting excessive blank lines (more than 2 consecutive)
    content = re.sub(r'\n{3,}', '\n\n', content)

    if content != original:
        filepath.write_text(content, encoding='utf-8')
        return True
    return False

def main():
    html_files = list(Path('/var/www/html').rglob('*.html'))

    modified_count = 0
    for filepath in html_files:
        if remove_gtag_from_file(filepath):
            print(f"Modified: {filepath.relative_to('/var/www/html')}")
            modified_count += 1
        else:
            print(f"Skipped (no gtag): {filepath.relative_to('/var/www/html')}")

    print(f"\nTotal files modified: {modified_count}")
    print(f"Total files scanned: {len(html_files)}")

if __name__ == '__main__':
    main()