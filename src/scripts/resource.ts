import { writeFile } from "node:fs/promises";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import manualFile from "../../data/manual.json" with { type: "json" };
import manualConfigFile from "../../data/manual-config.json" with {
	type: "json",
};
import { createResource } from "../entities.ts";
import type { Resource } from "../types.ts";

type Option = "plugin" | "config";

const forges = ["github", "srht"];
const forgesStr = forges.join(",");

let option = process.argv[2];
if (!option) {
	option = "plugin";
}
if (option !== "config" && option !== "plugin") {
	throw new Error('"config" and "plugin" are the only two choices');
}

const resource = await cli(option as Option);
save(resource).catch(console.error);

async function save(resource: Resource | undefined) {
	if (!resource) return;
	if (option === "plugin") {
		manualFile.resources.push(resource);
		const json = JSON.stringify(manualFile, null, 2);
		await writeFile("./data/manual.json", json);
	} else {
		manualConfigFile.resources.push(resource);
		const json = JSON.stringify(manualConfigFile, null, 2);
		await writeFile("./data/manual-config.json", json);
	}
}

async function cli(opt: "config" | "plugin") {
	const type =
		(await readInput(`code forge [${forgesStr}] (default: github):`)) ||
		"github";
	if (!forges.includes(type)) {
		throw new Error(`${type} is not a valid code forge, choose ${forgesStr}`);
	}

	const name = (await readInput("name (username/repo):")) || "";
	const [username, repo] = name.split("/");
	let tags: string[] = [];
	if (opt === "plugin") {
		console.log(
			"\nNOTICE: Please review all current tags and see if any fit, only add new tags if absolutely necessary\n",
		);
		const tagsRes = (await readInput("tags (comma separated):")) || "";
		tags = tagsRes.split(",");
	}

	return createResource({
		type: type as Resource["type"],
		username,
		repo,
		tags,
	});
}

async function readInput(prompt: string): Promise<string> {
	const rl = readline.createInterface({ input, output });
	const answer = await rl.question(`${prompt}\n`);
	rl.close();
	return answer.trim();
}
