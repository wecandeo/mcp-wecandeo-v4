import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../utils/response.js";

const searchParams = {
	searchItem: z
		.enum(["title", "series", "author", "copyright", "content", "tag", "etc"])
		.optional()
		.describe("Search field (partial match)"),
	keyword: z.string().optional().describe("Search keyword"),
	sortItem: z.enum(["id", "title", "duration", "filesize"]).optional().describe("Sort field (default id)"),
	sortDirection: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
	pageSize: z.number().optional().describe("Items per page"),
	page: z.number().optional().describe("Page number"),
};

/**
 * Video Data Retrieve API group (VideoPack v4).
 */
export function registerVideoTools(server: McpServer, client: WecandeoClient) {
	// Video list by package.
	server.tool(
		"wecandeo_video_list_package",
		"Retrieve the list of videos in a distribution package. Supports search, sort and pagination.",
		{
			packageId: z.number().describe("Distribution package ID"),
			folderId: z.number().optional().describe("Filter by media-archive folder ID"),
			...searchParams,
		},
		async (args) => jsonContent(await client.get("/info/videopack/package/v1/videos.json", args))
	);

	// Video list by folder.
	server.tool(
		"wecandeo_video_list_folder",
		"Retrieve the list of videos in a media-archive folder. Supports search, sort and pagination.",
		{
			folderId: z.number().describe("Media-archive folder ID"),
			...searchParams,
		},
		async (args) => jsonContent(await client.get("/info/videopack/folder/v1/videos.json", args))
	);

	// Video details (includes AI summaries when available).
	server.tool(
		"wecandeo_video_details",
		"Get detailed information of a video. Returns camelCase fields and AI summaries when available.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/detail/v1/info.json", { accessKey, packageId }))
	);

	// Distribution (publish) code.
	server.tool(
		"wecandeo_video_pub_code",
		"Get the distribution codes (video URL, play URL, per-file URLs) of a video in a package.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/publish/v1/info.json", { accessKey, packageId }))
	);

	// Encoded files.
	server.tool(
		"wecandeo_video_encoded_file",
		"Retrieve the list of encoded files (profiles) for a video.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/encoding/v1/file/info.json", { accessKey, packageId }))
	);

	// One-time key.
	server.tool(
		"wecandeo_video_onetime_key",
		"Generate a time-limited one-time access key for a video key (Level 2) or file key (Level 3).",
		{
			key: z.string().describe("Video Key (Level 2) or File Key (Level 3)"),
			expire: z.number().optional().describe("Expiration seconds from now (default 10)"),
		},
		async ({ key, expire }) =>
			jsonContent(await client.get("/info/videopack/auth/v1/key.json", { key, expire }))
	);

	// Thumbnail images.
	server.tool(
		"wecandeo_video_thumbnail",
		"Retrieve the thumbnail images (extracted frames, multiple sizes) of a video.",
		{ accessKey: z.string().describe("Original video access key (Level 1)") },
		async ({ accessKey }) =>
			jsonContent(await client.get("/info/videopack/thumbnail/v1/info.json", { accessKey }))
	);

	// Caption files.
	server.tool(
		"wecandeo_video_caption",
		"Retrieve the caption files of a video.",
		{ accessKey: z.string().describe("Original video access key (Level 1)") },
		async ({ accessKey }) =>
			jsonContent(await client.get("/info/videopack/caption/v1/info.json", { accessKey }))
	);
}
