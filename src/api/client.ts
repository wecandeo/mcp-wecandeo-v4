/**
 * HTTP client for the Wecandeo VideoPack v4 API.
 *
 * v4 exposes two families of endpoints:
 *  - Legacy endpoints on https://api.wecandeo.com (auth: `key` query parameter).
 *    Most upload / video-data / package / archive endpoints live here.
 *  - v4-native endpoints on https://api.v4.wecandeo.com (auth: `x-api-key` header),
 *    e.g. the video detail (info.json) and original download-url endpoints.
 */
export class WecandeoClient {
	private baseUrl = "https://api.wecandeo.com";
	private v4BaseUrl = "https://api.v4.wecandeo.com";
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	getApiKey(): string {
		return this.apiKey;
	}

	private buildUrl(baseUrl: string, path: string, params?: Record<string, any>): URL {
		const url = path.startsWith("http")
			? new URL(path)
			: new URL(`${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`);
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
	 * GET against the legacy api.wecandeo.com host.
	 * The API key is appended as the `key` query parameter automatically.
	 */
	async get(path: string, params: Record<string, any> = {}) {
		const url = this.buildUrl(this.baseUrl, path, params);
		if (!url.searchParams.has("key") && this.apiKey) {
			url.searchParams.set("key", this.apiKey);
		}
		const response = await fetch(url.toString(), {
			method: "GET",
			headers: { Accept: "application/json" },
		});
		return this.handle(response);
	}

	/**
	 * GET against the v4-native api.v4.wecandeo.com host.
	 * The API key is sent via the `x-api-key` header.
	 */
	async getV4(path: string, params: Record<string, any> = {}) {
		const url = this.buildUrl(this.v4BaseUrl, path, params);
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
