import { writeFile } from "node:fs/promises";
import manualPluginData from "../../data/manual.json" with { type: "json" };
import manualConfigData from "../../data/manual-config.json" with {
	type: "json",
};
import scrapePluginData from "../../data/scrape.json" with { type: "json" };
import scrapeConfigData from "../../data/scrape-config.json" with {
	type: "json",
};
import { getResourceId } from "../entities.ts";
import type { Resource, ResourceMap } from "../types.ts";

init().catch(console.error);

async function init() {
	const plugins = patch({
		scrapeData: scrapePluginData as unknown as ResourceContainer,
		manualData: manualPluginData as unknown as ResourceContainer,
	});
	await writeFile("./data/resources.json", plugins);

	const config = patch({
		scrapeData: scrapeConfigData as unknown as ResourceContainer,
		manualData: manualConfigData as unknown as ResourceContainer,
	});
	await writeFile("./data/resources-config.json", config);
}

interface ResourceContainer {
	resources: Resource[];
}

interface PatchOpt {
	scrapeData: ResourceContainer;
	manualData: ResourceContainer;
}

function patch({ scrapeData, manualData }: PatchOpt) {
	const db: ResourceMap = {};
	const scrapeResources = scrapeData.resources as Resource[];
	scrapeResources.forEach((r: Resource) => {
		db[getResourceId(r)] = r;
	});

	const manualResources = manualData.resources as Resource[];
	// resource file trumps what we scrape so we can make changes to things like the tags
	manualResources.forEach((r) => {
		db[getResourceId(r)] = r;
	});

	const newResources = Object.values(db).sort((a, b) => {
		if (a.username === b.username) {
			return a.repo.localeCompare(b.repo);
		}
		return a.username.localeCompare(b.username);
	});
	const data = { resources: newResources };
	const json = JSON.stringify(data, null, 2);
	return json;
}
