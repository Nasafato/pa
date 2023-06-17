import { run } from "https://deno.land/std@0.191.0/process/mod.ts";

async function computeNewCommits() {
  const latestTag = await run({
    cmd: ["git", "describe", "--tags", "--abbrev=0"],
    stdout: "piped",
  }).output();

  const newCommits = await run({
    cmd: [
      "git",
      "log",
      new TextDecoder().decode(latestTag) + "..HEAD",
      "--oneline",
    ],
    stdout: "piped",
  }).output();

  const hasNewCommits = new TextDecoder().decode(newCommits).trim().length > 0;

  return {
    latestTag,
    hasNewCommits,
  };
}

if (import.meta.main) {
  const { latestTag, hasNewCommits } = await computeNewCommits();

  if (hasNewCommits) {
    // You would have to implement incrementVersion and createNewTag
    // based on your preferred versioning scheme
    // const newVersion = incrementVersion();
    console.log(latestTag);
    // await createNewTag(newVersion);
  }
}
