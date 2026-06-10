import { readFile } from "node:fs/promises";
import path from "node:path";

export interface ResolvedFile {
	blob: Blob;
	fileName: string;
}

/**
 * Resolve a file source into a Blob suitable for multipart upload.
 *
 * `source` may be either:
 *  - a local filesystem path (e.g. /Users/me/video.mp4 or ./clip.mp4), or
 *  - a remote URL (http:// or https://).
 *
 * `fallbackName` is used when a file name cannot be derived from the source
 * (e.g. a URL without a meaningful path segment).
 */
export async function resolveFile(source: string, fallbackName: string): Promise<ResolvedFile> {
	const isRemote = source.startsWith("http://") || source.startsWith("https://");

	if (!isRemote) {
		// Local filesystem path.
		const buffer = await readFile(source);
		return {
			blob: new Blob([buffer]),
			fileName: path.basename(source) || fallbackName,
		};
	}

	// Remote URL — verify it is reachable, then download.
	const headResponse = await fetch(source, { method: "HEAD" }).catch(() => null);
	if (headResponse && !headResponse.ok) {
		throw new Error(
			`Source URL is not accessible (${headResponse.status} ${headResponse.statusText}): ${source}`
		);
	}

	const fileResponse = await fetch(source);
	if (!fileResponse.ok) {
		throw new Error(`Failed to download source URL (${fileResponse.status}): ${source}`);
	}
	const blob = await fileResponse.blob();

	let fileName = fallbackName;
	try {
		const urlPath = new URL(source).pathname;
		const base = path.basename(urlPath);
		if (base) fileName = base;
	} catch {
		/* keep fallback */
	}

	return { blob, fileName };
}
