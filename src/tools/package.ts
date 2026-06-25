import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonContent } from "../utils/response.js";

/**
 * Package API group (VideoPack v4).
 */
export function registerPackageTools(server: McpServer, client: WecandeoClient) {
	// Distribution package list.
	server.tool(
		"wecandeo_package_list",
		"Retrieve the list of distribution packages (packageId, packageType, packageName, sharing flags).",
		{},
		async () => jsonContent(await client.get("/info/videopack/package/v1/info.json"))
	);
}
