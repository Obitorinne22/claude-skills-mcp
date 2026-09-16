# 21st MCP (formerly Magic MCP)

Source: https://github.com/21st-dev/magic-mcp (commit 6b5299e) — ISC License, Copyright (c) 2026 21st.dev

HTTP MCP server for 21st.dev UI components: `https://21st.dev/api/mcp`.

## Setup

1. Get a free API key at https://21st.dev/mcp
2. Set env variable `API_KEY_21ST` (do not commit the key).
3. Use `mcp.json` from this folder, or run:

```bash
npx @21st-dev/cli@latest init --client claude
```

Claude Code plugin: `claude plugin marketplace add 21st-dev/magic-mcp`, then `/plugin install 21st`.

Companion skill: `skills/21st-ui/SKILL.md`.
