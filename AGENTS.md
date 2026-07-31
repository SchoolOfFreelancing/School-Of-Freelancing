# Repository Guidelines

## Project Structure & Module Organization
-  — application source code (primary language files).
-  — unit and integration tests.
-  — build, deploy and helper scripts.
-  — static files and resources.
-  and  — project docs.

Example: , .

## Build, Test, and Development Commands
-  — compile/build the project (if Makefile exists).
-  — install dependencies.
-  — run locally in development mode.
-  — run the test suite.
-  — run linters/formatters.

## Coding Style & Naming Conventions
- Use 2-space indentation for JS, 4 spaces for Python.
- Files:  for scripts,  for classes,  for variables/functions.
- Use ESLint/Prettier where configured; run  before commits.

## Testing Guidelines
- Tests live under  mirroring  layout.
- Use descriptive test names:  or .
- Aim for meaningful unit coverage; run  if supported.

## Commit & Pull Request Guidelines
- Use imperative, short commit titles: .
- Include a body when needed and reference issue IDs: .
- PRs must include: description, test plan, and screenshots for UI changes.
- Require at least one reviewer and passing CI before merge.

## Security & Configuration Tips
- Do not commit secrets; use environment variables () and add  to .
- Store sensitive configs in a secrets manager.

