/** Shared MCP tool response helpers. */

export const jsonContent = (result: unknown) => ({
	content: [
		{
			type: "text" as const,
			text: typeof result === "string" ? result : JSON.stringify(result, null, 2),
		},
	],
});

export const errorContent = (message: string) => ({
	content: [{ type: "text" as const, text: `Error: ${message}` }],
	isError: true,
});
