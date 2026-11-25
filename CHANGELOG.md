# Changelog

All notable changes to **SOF (School Of Freelancing)** (`https://schooloffreelancing.com`) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## - 2026-11-25

### Added
- **Full 86-Page FAQPage & Schema Parity:** Added visible Frequently Asked Questions sections, `FAQPage` JSON-LD blocks, and `index.md` FAQ sections across all 86 canonical and 86 AMP pages (172 HTML files total).
- **Homepage AEO/GEO Depth:** Added a single semantic `<h1>`, 60-word direct answer summary, structured comparison table, and `HowTo` JSON-LD schema.
- **GNU GPL v3.0 & REUSE 3.2 Compliance:** Added official `LICENSE` (`GPL-3.0-or-later`), `LICENSES/GPL-3.0-or-later.txt`, `REUSE.toml`, `COPYRIGHT.md`, inline SPDX headers across `.py`, `.js`, and `.sh` scripts, and automated CI checks in `.github/workflows/reuse.yml` and `.gitlab-ci.yml`.
- **Single-Source-of-Truth `README.md`:** Generated a complete canonical directory covering all 21 courses, 23 fixed-price services, 9 resource guides, 20 country hubs, and 5 legal documents.

### Changed
- **Unified Brand Entity & Contact Details:** Standardized canonical brand naming to `SOF (School Of Freelancing)`, unified `sameAs` social/developer URLs, and aligned official contact email to `support@schooloffreelancing.com` across all pages and AI discovery files (`llms.txt`, `llms-full.txt`, `ai.txt`).
- **Credential Privacy & Claim Verification:** Centralized government freelancer ID display on `/legal/credential-verification` with direct verification links across all other pages, and aligned service SLA and pricing copy across hubs.
- **Homepage Title Optimization:** Updated homepage `<title>` to `Live Linux & AI Freelancing Training + Server Support | SOF (School Of Freelancing)`.

### Fixed
- **JSON-LD & AMP Validation:** Resolved JSON-LD syntax edge cases and verified 86/86 AMP pages pass `amphtml-validator`.

## - 2026-11-24

### Added
- **Agentic Web & WebMCP Support:** Published `/.well-known/webmcp.json`, `/.well-known/agent-card.json`, `/.well-known/agent-skills.json`, and `webmcp/tools.js` across all 86 canonical pages.
- **Per-Page AI Discovery:** Generated per-directory `index.md` and `ai.txt` files alongside root `llms.txt` and `llms-full.txt`.
