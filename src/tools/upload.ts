import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveFile } from "../utils/file.js";
import { jsonContent, errorContent } from "../utils/response.js";

/**
 * Upload API group (VideoPack v4).
 */
export function registerUploadTools(server: McpServer, client: WecandeoClient) {
	// Upload token (V4) — prerequisite for every file upload.
	server.tool(
		"wecandeo_upload_create_token",
		"Create a V4 upload token. Returns uploadUrl, thumbnailUploadUrl, captionUploadUrl, uploadCancelUrl and token. A token can upload exactly one file.",
		{},
		async () => {
			const result = await client.get("/web/v4/uploadToken.json");
			return jsonContent(result);
		}
	);

	// Upload a video file (local path or remote URL).
	server.tool(
		"wecandeo_upload_video",
		"Upload a video file using a V4 upload token. `source` can be a local filesystem path or a remote http(s) URL.",
		{
			uploadUrl: z.string().describe("uploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token from wecandeo_upload_create_token"),
			source: z.string().describe("Local file path (e.g. /path/video.mp4) or remote URL of the video"),
			folder: z.number().describe("Target media-archive folder ID"),
			pkg: z.number().optional().describe("Distribution package ID. When set, encoding and a distribution URL are issued."),
			cid: z.string().optional().describe("Custom user-defined ID (max 64 chars)"),
			rename: z.string().optional().describe("Rename the source file (without extension)"),
			callback: z.string().optional().describe("Callback URL. Redirected as GET {callback}?data={JSON}"),
			title: z.string().optional().describe("Video title"),
			series: z.string().optional().describe("Series name"),
			author: z.string().optional().describe("Author / creator"),
			copyright: z.string().optional().describe("Copyright info"),
			rate: z.string().optional().describe("Viewing rating"),
			content: z.string().optional().describe("Description / content"),
			tag: z.string().optional().describe("Comma-separated tags"),
		},
		async ({ uploadUrl, token, source, folder, ...optional }) => {
			let file;
			try {
				file = await resolveFile(source, "video.mp4");
			} catch (err: any) {
				return errorContent(`Cannot read video source: ${err.message}`);
			}

			const formData = new FormData();
			formData.append("token", token);
			formData.append("folder", String(folder));
			for (const [key, value] of Object.entries(optional)) {
				if (value !== undefined && value !== null) formData.append(key, String(value));
			}
			formData.append("videofile", file.blob, file.fileName);

			const response = await fetch(`${uploadUrl}?token=${encodeURIComponent(token)}`, {
				method: "POST",
				body: formData,
			});
			return jsonContent(await response.text());
		}
	);

	// Upload status (string state machine).
	server.tool(
		"wecandeo_upload_video_status",
		"Check the upload status of a video by token. Returns a status such as UPLOADING, UPLOADED, THUMBS, DEPLOY, COMPLETE, U_ERROR, FILEOVER.",
		{
			uploadUrl: z.string().describe("uploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token"),
		},
		async ({ uploadUrl, token }) => {
			const response = await fetch(`${uploadUrl}/status.json?token=${encodeURIComponent(token)}`);
			return jsonContent(await response.text());
		}
	);

	// Upload progress (percentage + transferred bytes).
	server.tool(
		"wecandeo_upload_video_progress",
		"Check the upload progress of a video by token. Returns process (0-100%) and transferred byte counters.",
		{
			uploadUrl: z.string().describe("uploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token"),
		},
		async ({ uploadUrl, token }) => {
			const response = await fetch(`${uploadUrl}/uploadStatus.json?token=${encodeURIComponent(token)}`);
			return jsonContent(await response.text());
		}
	);

	// Encoding status.
	server.tool(
		"wecandeo_video_encoding_status",
		"Check the encoding status of an uploaded video. Returns per-profile process (0-100) and status.",
		{
			access_key: z.string().describe("Original video access key (Level 1)"),
			pkg: z.number().describe("Distribution package ID"),
		},
		async ({ access_key, pkg }) => {
			const result = await client.get("/web/encoding/status.json", { access_key, pkg });
			return jsonContent(result);
		}
	);

	// Upload thumbnail (local path or remote URL).
	server.tool(
		"wecandeo_upload_thumbnail",
		"Upload a thumbnail image for a video using a V4 upload token. `source` can be a local file path or a remote URL.",
		{
			thumbnailUploadUrl: z.string().describe("thumbnailUploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token"),
			access_key: z.string().describe("Original video access key (Level 1) to attach the image to"),
			source: z.string().describe("Local file path or remote URL of the thumbnail image"),
		},
		async ({ thumbnailUploadUrl, token, access_key, source }) => {
			let file;
			try {
				file = await resolveFile(source, "thumbnail.jpg");
			} catch (err: any) {
				return errorContent(`Cannot read thumbnail source: ${err.message}`);
			}

			const formData = new FormData();
			formData.append("token", token);
			formData.append("access_key", access_key);
			formData.append("imagefile", file.blob, file.fileName);

			const response = await fetch(`${thumbnailUploadUrl}?token=${encodeURIComponent(token)}`, {
				method: "POST",
				body: formData,
			});
			return jsonContent(await response.text());
		}
	);

	// Upload caption (WebVTT, local path or remote URL).
	server.tool(
		"wecandeo_upload_caption",
		"Upload a WebVTT (.vtt) caption file for a video. `source` can be a local file path or a remote URL.",
		{
			captionUploadUrl: z.string().describe("captionUploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token"),
			access_key: z.string().describe("Original video access key (Level 1) to attach the caption to"),
			source: z.string().describe("Local file path or remote URL of the .vtt caption file"),
			lang_id: z.number().optional().describe("Language code ID from wecandeo_upload_caption_language (default 10000 = Korean)"),
			caption_type: z.enum(["STANDARD", "SDH"]).optional().describe("Caption type: STANDARD (default) or SDH (for the hearing impaired)"),
		},
		async ({ captionUploadUrl, token, access_key, source, lang_id, caption_type }) => {
			let file;
			try {
				file = await resolveFile(source, "caption.vtt");
			} catch (err: any) {
				return errorContent(`Cannot read caption source: ${err.message}`);
			}

			const formData = new FormData();
			formData.append("token", token);
			formData.append("access_key", access_key);
			if (lang_id !== undefined) formData.append("lang_id", String(lang_id));
			if (caption_type) formData.append("caption_type", caption_type);
			formData.append("captionfile", file.blob, file.fileName);

			const query = new URLSearchParams({ token, access_key });
			if (lang_id !== undefined) query.set("lang_id", String(lang_id));
			if (caption_type) query.set("caption_type", caption_type);

			const response = await fetch(`${captionUploadUrl}?${query.toString()}`, {
				method: "POST",
				body: formData,
			});
			return jsonContent(await response.text());
		}
	);

	// Caption language code list.
	server.tool(
		"wecandeo_upload_caption_language",
		"Retrieve the list of supported caption languages and their lang_id codes.",
		{},
		async () => {
			const result = await client.get("/info/v1/video/caption/language.json");
			return jsonContent(result);
		}
	);
}
