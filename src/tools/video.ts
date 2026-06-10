import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../utils/response.js";

const searchParams = {
	search_item: z
		.enum(["cid", "title", "series", "author", "copyright", "content", "tag", "etc"])
		.optional()
		.describe("Search field (cid is exact match, others partial)"),
	keyword: z.string().optional().describe("Search keyword"),
	sort_item: z.enum(["id", "title", "duration", "filesize"]).optional().describe("Sort field"),
	sort_direction: z.enum(["asc", "desc"]).optional().describe("Sort direction"),
	pagesize: z.number().optional().describe("Items per page"),
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
			pkg: z.number().describe("Distribution package ID"),
			url_key: z.string().optional().describe("Multi-domain classification key (default: default)"),
			...searchParams,
		},
		async (args) => jsonContent(await client.get("/info/v1/videos.json", args))
	);

	// Video list by folder.
	server.tool(
		"wecandeo_video_list_folder",
		"Retrieve the list of videos in a media-archive folder. Supports search, sort and pagination.",
		{
			folder: z.number().describe("Media-archive folder ID"),
			...searchParams,
		},
		async (args) => jsonContent(await client.get("/info/v1/folder/videos.json", args))
	);

	// Video details (legacy host).
	server.tool(
		"wecandeo_video_details",
		"Get detailed information of a video (legacy endpoint). Returns videoInfo and thumbnails.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/detail.json", { access_key, pkg }))
	);

	// Video details (v4-native host) — includes AI summaries when available.
	server.tool(
		"wecandeo_video_details_v4",
		"Get detailed information of a video via the v4-native endpoint. Returns camelCase fields and AI summaries when available.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.string().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.getV4("/info/videopack/detail/v1/info.json", { accessKey, packageId }))
	);

	// Distribution (publish) code.
	server.tool(
		"wecandeo_video_pub_code",
		"Get the distribution codes (video URL, play URL, per-file URLs) of a video in a package.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
			url_key: z.string().optional().describe("Multi-domain classification key (default: default)"),
		},
		async (args) => jsonContent(await client.get("/info/v1/video/publishInfo.json", args))
	);

	// Encoded files.
	server.tool(
		"wecandeo_video_encoded_file",
		"Retrieve the list of encoded files (profiles) for a video.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.string().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) =>
			jsonContent(await client.get("/info/v1/video/encodingFiles.json", { access_key, pkg }))
	);

	// One-time key.
	server.tool(
		"wecandeo_video_onetime_key",
		"Generate a time-limited one-time access key for a video/file key.",
		{
			access_key: z.string().describe("Video Key (Level 2) or File Key (Level 3)"),
			expire: z.number().optional().describe("Expiration seconds from now (default 10)"),
		},
		async ({ access_key, expire }) =>
			jsonContent(await client.get("/info/auth/accessKey.json", { access_key, expire }))
	);

	// Thumbnail images.
	server.tool(
		"wecandeo_video_thumbnail",
		"Retrieve the thumbnail images (6 frames, multiple sizes) of a video.",
		{ access_key: z.string().describe("Original video access key (Level 1)") },
		async ({ access_key }) =>
			jsonContent(await client.get("/info/v2/video/thumbnails.json", { access_key }))
	);

	// Caption files.
	server.tool(
		"wecandeo_video_caption",
		"Retrieve the caption files of a video.",
		{ access_key: z.string().describe("Original video access key (Level 1)") },
		async ({ access_key }) =>
			jsonContent(await client.get("/info/v1/video/caption.json", { access_key }))
	);
}
