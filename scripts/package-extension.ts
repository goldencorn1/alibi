import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)); const source = path.join(root, "..", "extension"); const build = path.join(root, "..", "artifacts", "extension", "unpacked");
const execFileAsync = promisify(execFile);
await rm(build, { recursive: true, force: true }); await mkdir(path.join(build, "popup"), { recursive: true }); await mkdir(path.join(build, "options"), { recursive: true });
await cp(path.join(source, "manifest.json"), path.join(build, "manifest.json")); await cp(path.join(source, "content.ts"), path.join(build, "content.js")); await cp(path.join(source, "background.ts"), path.join(build, "background.js")); await cp(path.join(source, "popup", "index.html"), path.join(build, "popup", "index.html")); await cp(path.join(source, "popup", "popup.ts"), path.join(build, "popup", "popup.js")); await cp(path.join(source, "options", "index.html"), path.join(build, "options", "index.html"));
await writeFile(path.join(build, "BUILD-METADATA.json"), JSON.stringify({ status: "local_unpacked", generated_at: new Date().toISOString(), data_status: "recorded", permissions: ["activeTab", "storage"], public_release: false }, null, 2));
const archive = path.join(root, "..", "artifacts", "extension", "alibi-extension.zip"); await rm(archive, { force: true });
if (process.platform === "darwin") {
  await execFileAsync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", build, archive]);
} else {
  await execFileAsync(process.platform === "win32" ? "tar.exe" : "tar", ["-a", "-c", "-f", archive, "-C", build, "."]);
}
console.log(JSON.stringify({ build, archive, status: "unpacked_ready", public_release: false }));
