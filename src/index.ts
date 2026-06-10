#!/usr/bin/env node

import { createRequire } from "node:module";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WecandeoClient } from "./api/client.js";
import { registerUploadTools } from "./tools/upload.js";
import { registerVideoTools } from "./tools/video.js";
import { registerVideoUpdateTools } from "./tools/video_update.js";
import { registerPackageTools } from "./tools/package.js";
import { registerArchiveTools } from "./tools/archive.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

async function main() {
	const apiKey = process.env.WECANDEO_API_KEY;
	if (!apiKey) {
		console.error("Error: WECANDEO_API_KEY environment variable is required.");
		console.error("Usage: WECANDEO_API_KEY=your_key npx @pluto90/wecandeo-v4-mcp");
		process.exit(1);
	}

	const client = new WecandeoClient(apiKey);

	const server = new McpServer({
		name: "wecandeo-videopack-v4-mcp",
		version,
	});

	registerUploadTools(server, client);
	registerVideoTools(server, client);
	registerVideoUpdateTools(server, client);
	registerPackageTools(server, client);
	registerArchiveTools(server, client);

	server.tool("ping", "Check if the Wecandeo VideoPack v4 MCP server is responsive", {}, async () => ({
		content: [{ type: "text", text: "pong" }],
	}));

	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("Wecandeo VideoPack v4 MCP Server started (stdio mode)");
}

main().catch((error) => {
	console.error("Fatal error:", error);
	process.exit(1);
});
