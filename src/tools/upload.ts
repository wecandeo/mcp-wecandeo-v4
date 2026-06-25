import { WecandeoClient } from "../api/client.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveFile } from "../utils/file.js";
import { jsonContent, errorContent } from "../utils/response.js";

/**
 * Upload API group (VideoPack v4).
 *
 * v4 upload model: each file (video / thumbnail / caption) needs its own
 * upload token. A token response is `{ ver, uploadUrl, token }`; the file is
 * then POSTed as multipart/form-data to `{uploadUrl}?token={token}` with a
 * `file` form field. Thumbnail and caption tokens are issued per accessKey.
 */
export function registerUploadTools(server: McpServer, client: WecandeoClient) {
	// Video upload token — prerequisite for a video file upload.
	server.tool(
		"wecandeo_upload_create_token",
		"Create a V4 video upload token. Returns { ver, uploadUrl, token }. A token uploads exactly one file and is valid for 60 minutes.",
		{},
		async () => jsonContent(await client.get("/info/videopack/upload/v1/token.json"))
	);

	// Upload a video file (local path or remote URL).
	server.tool(
		"wecandeo_upload_video",
		"Upload a video file using a V4 upload token. `source` can be a local filesystem path or a remote http(s) URL.",
		{
			uploadUrl: z.string().describe("uploadUrl from wecandeo_upload_create_token"),
			token: z.string().describe("Upload token from wecandeo_upload_create_token"),
			source: z.string().describe("Local file path (e.g. /path/video.mp4) or remote URL of the video"),
			folderId: z.number().describe("Target media-archive folder ID"),
			packageId: z.number().optional().describe("Distribution package ID. When set, encoding and a distribution URL are issued."),
			cid: z.string().optional().describe("Custom user-defined ID (max 64 chars)"),
			rename: z.string().optional().describe("Rename the source file (without extension)"),
			callback: z.string().optional().describe("Callback URL. Redirected as GET {callback}?data={JSON}"),
			title: z.string().optional().describe("Video title"),
			series: z.string().optional().describe("Series name"),
			author: z.string().optional().describe("Author / creator"),
			copyright: z.string().optional().describe("Copyright info"),
			rate: z.string().optional().describe("Viewing rating"),
			content: z.string().optional().describe("Description / content"),
			tag: z.string().optional().describe("Comma-separated tags (e.g. tag1,tag2,tag3)"),
			etc: z.string().optional().describe("Etc info"),
			orgFileDel: z.enum(["Y", "N"]).optional().describe("Delete the original after encoding (Y/N, default N). Requires packageId."),
		},
		async ({ uploadUrl, token, source, ...fields }) => {
			let file;
			try {
				file = await resolveFile(source, "video.mp4");
			} catch (err: any) {
				return errorContent(`Cannot read video source: ${err.message}`);
			}

			const formData = new FormData();
			for (const [key, value] of Object.entries(fields)) {
				if (value !== undefined && value !== null) formData.append(key, String(value));
			}
			formData.append("file", file.blob, file.fileName);

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
		{ token: z.string().describe("Upload token from wecandeo_upload_create_token") },
		async ({ token }) => jsonContent(await client.get("/info/videopack/upload/v1/status.json", { token }))
	);

	// Upload progress (percentage + transferred bytes).
	server.tool(
		"wecandeo_upload_video_progress",
		"Check the upload progress of a video by token. Returns process (0-100%) and transferred byte counters.",
		{ token: z.string().describe("Upload token from wecandeo_upload_create_token") },
		async ({ token }) => jsonContent(await client.get("/info/videopack/upload/v1/progress.json", { token }))
	);

	// Encoding status.
	server.tool(
		"wecandeo_video_encoding_status",
		"Check the encoding status of an uploaded video. Returns per-profile process (0-100) and status.",
		{
			accessKey: z.string().describe("Original video access key (Level 1)"),
			packageId: z.number().describe("Distribution package ID"),
		},
		async ({ accessKey, packageId }) =>
			jsonContent(await client.get("/info/videopack/encoding/v1/status.json", { accessKey, packageId }))
	);

	// Upload thumbnail (local path or remote URL). Fetches its own token by accessKey.
	server.tool(
		"wecandeo_upload_thumbnail",
		"Upload a thumbnail image for a video. Issues a thumbnail upload token for the accessKey then uploads. `source` can be a local file path or a remote URL.",
		{
			accessKey: z.string().describe("Original video access key (Level 1) to attach the image to"),
			source: z.string().describe("Local file path or remote URL of the thumbnail image"),
		},
		async ({ accessKey, source }) => {
			let file;
			try {
				file = await resolveFile(source, "thumbnail.jpg");
			} catch (err: any) {
				return errorContent(`Cannot read thumbnail source: ${err.message}`);
			}

			const tokenInfo = await client.get("/info/videopack/thumbnail/v1/upload/token.json", { accessKey });
			const { uploadUrl, token } = tokenInfo ?? {};
			if (!uploadUrl || !token) {
				return jsonContent(tokenInfo);
			}

			const formData = new FormData();
			formData.append("file", file.blob, file.fileName);

			const response = await fetch(`${uploadUrl}?token=${encodeURIComponent(token)}`, {
				method: "POST",
				body: formData,
			});
			return jsonContent(await response.text());
		}
	);

	// Upload caption (WebVTT, local path or remote URL). Fetches its own token by accessKey.
	server.tool(
		"wecandeo_upload_caption",
		"Upload a WebVTT (.vtt) caption file for a video. Issues a caption upload token for the accessKey then uploads. `source` can be a local file path or a remote URL.",
		{
			accessKey: z.string().describe("Original video access key (Level 1) to attach the caption to"),
			source: z.string().describe("Local file path or remote URL of the .vtt caption file"),
			langId: z.number().optional().describe("Language code ID from wecandeo_upload_caption_language"),
			captionType: z.enum(["STANDARD", "SDH"]).optional().describe("Caption type: STANDARD (default) or SDH (for the hearing impaired)"),
		},
		async ({ accessKey, source, langId, captionType }) => {
			let file;
			try {
				file = await resolveFile(source, "caption.vtt");
			} catch (err: any) {
				return errorContent(`Cannot read caption source: ${err.message}`);
			}

			const tokenInfo = await client.get("/info/videopack/caption/v1/upload/token.json", { accessKey });
			const { uploadUrl, token } = tokenInfo ?? {};
			if (!uploadUrl || !token) {
				return jsonContent(tokenInfo);
			}

			const formData = new FormData();
			if (langId !== undefined) formData.append("langId", String(langId));
			if (captionType) formData.append("captionType", captionType);
			formData.append("file", file.blob, file.fileName);

			const response = await fetch(`${uploadUrl}?token=${encodeURIComponent(token)}`, {
				method: "POST",
				body: formData,
			});
			return jsonContent(await response.text());
		}
	);

	// Caption language code list.
	server.tool(
		"wecandeo_upload_caption_language",
		"Retrieve the list of supported caption languages and their langId codes.",
		{},
		async () => jsonContent(await client.get("/info/videopack/caption/v1/language.json"))
	);
}
