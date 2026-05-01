# foundry-live (optional)

We do not ship a live-bridge server with this template because a good one already exists:

- **foundry-api-bridge** (a.k.a. Foundry MCP) — https://foundryvtt.com/packages/foundry-api-bridge
- **adambdooley/foundry-vtt-mcp** — https://github.com/adambdooley/foundry-vtt-mcp

To enable:

1. Install the companion module in your Foundry world (it runs the WebSocket server).
2. Install the MCP client half according to the project's README.
3. Add an entry to `.mcp.json`, for example:

   ```json
   {
     "foundry-live": {
       "command": "npx",
       "args": ["-y", "foundry-mcp-server"],
       "env": { "FOUNDRY_WS_URL": "ws://localhost:31415" }
     }
   }
   ```
