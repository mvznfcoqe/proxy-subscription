import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "https://cdn.remna.st/docs/openapi.json",
	output: "./src/api/generated/remnawave",
	plugins: ["@hey-api/client-ofetch"],
});
