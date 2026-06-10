import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../utils/response.js";

/**
 * Video Data Update API group (VideoPack v4).
 */
export function registerVideoUpdateTools(server: McpServer, client: WecandeoClient) {
	// Add video to package.
	server.tool(
		"wecandeo_video_add_to_package",
		"Add a video to a distribution package (triggers encoding / URL issuance).",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/set/package.json", { access_key, pkg }))
	);

	// Exclude video from package.
	server.tool(
		"wecandeo_video_exclude_from_package",
		"Exclude a video from a distribution package.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/set/exclude.json", { access_key, pkg }))
	);

	// Start publish.
	server.tool(
		"wecandeo_video_start_publish",
		"Start publishing (distributing) a video within a package.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/set/publish.json", { access_key, pkg }))
	);

	// Pause publish.
	server.tool(
		"wecandeo_video_pause_publish",
		"Pause publishing (distributing) a video within a package.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/set/pause.json", { access_key, pkg }))
	);

	// Modify archive folder (move video).
	server.tool(
		"wecandeo_video_modify_folder",
		"Move a video to a different media-archive folder.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			folder: z.number().describe("Target media-archive folder ID"),
		},
		async ({ access_key, folder }) =>
			jsonContent(await client.get("/info/v1/video/set/folder.json", { access_key, folder }))
	);

	// Modify metadata.
	server.tool(
		"wecandeo_video_modify_meta",
		"Modify the metadata (title, series, author, copyright, rate, content, etc, tag) of a video.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			title: z.string().optional().describe("Title"),
			series: z.string().optional().describe("Series"),
			author: z.string().optional().describe("Author"),
			copyright: z.string().optional().describe("Copyright"),
			rate: z.string().optional().describe("Viewing rating"),
			content: z.string().optional().describe("Content / description"),
			etc: z.string().optional().describe("Etc"),
			tag: z.string().optional().describe("Comma-separated tags (e.g. tag1,tag2,tag3)"),
		},
		async (args) => jsonContent(await client.get("/info/v1/video/set/detail.json", args))
	);

	// Set default (represent) thumbnail.
	server.tool(
		"wecandeo_video_set_default_thumbnail",
		"Set a specific extracted thumbnail (by sequence) as the video's default thumbnail.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			seq: z.number().describe("Thumbnail sequence number (1-6)"),
		},
		async ({ access_key, seq }) =>
			jsonContent(await client.get("/info/v1/video/set/thumbnail.json", { access_key, seq }))
	);
}
