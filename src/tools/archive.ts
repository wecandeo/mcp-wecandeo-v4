import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonContent } from "../utils/response.js";

/**
 * Media Archive API group (VideoPack v4).
 */
export function registerArchiveTools(server: McpServer, client: WecandeoClient) {
	// Create folder.
	server.tool(
		"wecandeo_archive_create_folder",
		"Create a new video folder in the media archive. Returns the new folder ID.",
		{ folder_name: z.string().describe("Name of the folder to create") },
		async ({ folder_name }) =>
			jsonContent(await client.get("/info/v1/folder/create.json", { folder_name }))
	);

	// Folder list.
	server.tool(
		"wecandeo_archive_list_folders",
		"Retrieve the list of video folders in the media archive.",
		{},
		async () => jsonContent(await client.get("/info/v1/folders.json"))
	);

	// Folder by name.
	server.tool(
		"wecandeo_archive_folder_by_name",
		"Look up a media-archive video folder by its name.",
		{ folder_name: z.string().describe("Folder name to look up") },
		async ({ folder_name }) =>
			jsonContent(await client.get("/info/v1/folderByName.json", { folder_name }))
	);

	// Original download URL (v4-native host). URL is valid for 2 days.
	server.tool(
		"wecandeo_archive_original_download_url",
		"Get the download URL of the original video in the media archive. The URL is valid for 2 days.",
		{ accessKey: z.string().describe("Original video access key (Level 1)") },
		async ({ accessKey }) =>
			jsonContent(await client.getV4("/info/videopack/folder/v1/download.json", { accessKey }))
	);
}
