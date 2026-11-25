# Contributing to SOF (School Of Freelancing)

Thank you for your interest in contributing to **SOF (School Of Freelancing)** (`https://schooloffreelancing.com`).

## 1. Repository Architecture & Single Source of Truth (SSOT)

- **Canonical Pages (`86`):** Every page lives at its clean canonical path without trailing slashes (for example, `/freelancing-training/linux-freelancing-training`) alongside its paired AMP page (`/amp/index.html`) and Markdown mirror (`index.md`).
- **Machine-Readable Discovery:** Root manifests (`llms.txt`, `llms-full.txt`, `ai.txt`, `sitemap.xml`, `video-sitemap.xml`) and `/.well-known/*` files (`webmcp.json`, `agent-card.json`, `agent-skills.json`) must remain synchronized with canonical HTML content.
- **Verified Entity Facts:** Any edits referencing pricing, SLAs, contact details (`support@schooloffreelancing.com`), or credentials (`/legal/credential-verification`) must match the canonical source pages.

## 2. Quality & Validation Checklist Before Submitting a Pull Request

1. **AMP Validation:** Run `npx amphtml-validator` on any modified `/amp/index.html` files and confirm `PASS` with zero warnings or errors.
2. **JSON-LD Integrity:** Ensure all `<script type="application/ld+json">` blocks parse as valid JSON and match visible page content.
3. **REUSE / SPDX License Compliance:**
   - All contributions are licensed under **GNU General Public License v3.0 or later (`GPL-3.0-or-later`)**.
   - New `.py`, `.js`, or `.sh` scripts must include the standard `GPL-3.0-or-later` SPDX license identifier comment at the top of the file.
   - New asset file extensions must be covered in `REUSE.toml` and pass `reuse lint`.

## 3. Submitting Changes

1. Fork the repository on [GitHub](https://github.com) or [GitLab](https://gitlab.com).
2. Create a descriptive feature or fix branch (`feat/topic-name` or `fix/issue-name`).
3. Verify that automated CI checks (`REUSE Compliance Check` on GitHub Actions and `reuse_lint` on GitLab CI) pass before requesting review.

## 4. Support & Contact

- **Official Website:** https://schooloffreelancing.com
- **Email:** support@schooloffreelancing.com
