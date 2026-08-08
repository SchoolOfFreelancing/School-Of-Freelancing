---
name: add-page-checklist
description: Checklist of files to update when adding a new training/support catalog item or adding/renaming any page on the School of Freelancing site (sitemap.xml, llms-full.txt, hub card grid, footer, .htaccess redirects).
---

When adding a new training/support item, update:
- The hub page's card grid
- The footer block (if it should be one of the featured items)
- `sitemap.xml`
- `llms-full.txt`

When adding or renaming any page, update:
- `sitemap.xml` (comprehensive, not an index — lists every page directly)
- `llms-full.txt`
- Add a redirect in `.htaccess` if an old URL is being replaced

See the "Watch for this class of bug when renaming a page/folder" note in CLAUDE.md for the full list of hardcoded-URL locations to check (canonical/OG/JSON-LD tags, sitemap fragments, llms.txt).
