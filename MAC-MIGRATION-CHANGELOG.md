# Mac Migration Changelog

## v0.7 snapshot — 2026-09-04

- Created isolated staging outside the Windows source directory.
- Copied current source, tests, fixtures, local model files, contracts, migrations, MCP, extension and documentation.
- Excluded dependencies, Next build caches, output verification trees, logs, test caches, local environment files and credentials.
- Added macOS-first setup/readme, environment matrix, safe templates and five LF shell scripts.
- Preserved current product behavior and API/news-provider boundaries; no product feature, dependency, database model or architecture change was made.
- Source was not a Git repository; no Git bundle was generated.
- Existing Windows-only path references were recorded in `MAC-PORTABILITY-ISSUES.md`; no functional source rewrite was applied.
