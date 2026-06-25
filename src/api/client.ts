/**
 * HTTP client for the Wecandeo VideoPack v4 API.
 *
 * All endpoints live on the v4 host https://api.v4.wecandeo.com and follow the
 * `/info/videopack/{group}/v1/{action}.json` path scheme. Authentication is done
 * with the `x-api-key` header (NOT the legacy `key` query parameter used by the
 * v3 host api.wecandeo.com). Parameters and response fields are camelCase.
 */
export class WecandeoClient {
	private baseUrl = "https://api.v4.wecandeo.com";
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	getApiKey(): string {
		return this.apiKey;
	}

	private buildUrl(path: string, params?: Record<string, any>): URL {
		const url = path.startsWith("http")
			? new URL(path)
			: new URL(`${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (value !== undefined && value !== null) {
					url.searchParams.set(key, String(value));
				}
			}
		}
		return url;
	}

	private async handle(response: Response) {
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Wecandeo API Error (${response.status}): ${errorText}`);
		}
		const text = await response.text();
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	}

	/**
	 * GET against the v4 host. The API key is sent via the `x-api-key` header.
	 */
	async get(path: string, params: Record<string, any> = {}) {
		const url = this.buildUrl(path, params);
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				Accept: "application/json",
				"x-api-key": this.apiKey,
			},
		});
		return this.handle(response);
	}
}
