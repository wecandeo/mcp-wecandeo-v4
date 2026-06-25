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
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/package/v1/set/include.json", { accessKey, packageId }))
	);

	// Exclude video from package.
	server.tool(
		"wecandeo_video_exclude_from_package",
		"Exclude a video from a distribution package.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/package/v1/set/exclude.json", { accessKey, packageId }))
	);

	// Start publish.
	server.tool(
		"wecandeo_video_start_publish",
		"Start publishing (distributing) a video within a package.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/package/v1/set/publish.json", { accessKey, packageId }))
	);

	// Pause publish.
	server.tool(
		"wecandeo_video_pause_publish",
		"Pause publishing (distributing) a video within a package.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/package/v1/set/pause.json", { accessKey, packageId }))
	);

	// Modify archive folder (move video).
	server.tool(
		"wecandeo_video_modify_folder",
		"Move a video to a different media-archive folder.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			folderId: z.number().describe("Target media-archive folder ID"),
		},
		async ({ accessKey, folderId }) =>
			jsonContent(await client.get("/info/videopack/folder/v1/set/change.json", { accessKey, folderId }))
	);

	// Modify metadata.
	server.tool(
		"wecandeo_video_modify_meta",
		"Modify the metadata (title, series, author, copyright, rate, content, etc, tag) of a video.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			title: z.string().optional().describe("Title"),
			series: z.string().optional().describe("Series"),
			author: z.string().optional().describe("Author"),
			copyright: z.string().optional().describe("Copyright"),
			rate: z.string().optional().describe("Viewing rating"),
			content: z.string().optional().describe("Content / description"),
			etc: z.string().optional().describe("Etc"),
			tag: z.string().optional().describe("Comma-separated tags (e.g. tag1,tag2,tag3)"),
		},
		async (args) => jsonContent(await client.get("/info/videopack/detail/v1/set/info.json", args))
	);

	// Set default (represent) thumbnail.
	server.tool(
		"wecandeo_video_set_default_thumbnail",
		"Set a specific extracted thumbnail (by sequence) as the video's default thumbnail.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			seq: z.number().describe("Thumbnail sequence number (0-5)"),
		},
		async ({ accessKey, seq }) =>
			jsonContent(await client.get("/info/videopack/thumbnail/v1/set/info.json", { accessKey, seq }))
	);
}
