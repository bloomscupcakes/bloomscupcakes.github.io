import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found in the repository root.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const lines = envContent.split(/\r?\n/);
const secrets = lines
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => {
    const [key, ...valueParts] = line.split("=");
    return { key: key.trim(), value: valueParts.join("=").trim() };
  })
  .filter((item) => item.key && item.value !== undefined);

if (secrets.length === 0) {
  console.error("Error: No environment variables found in .env to push.");
  process.exit(1);
}

const repoArg = process.argv[2];
const repoFlag = repoArg ? `--repo ${repoArg}` : "";

console.log("Pushing secrets from .env to GitHub repository secrets...");
console.log("Make sure you have authenticated with 'gh auth login' and have repo write access.");

for (const { key, value } of secrets) {
  try {
    console.log(`> Setting secret ${key}`);
    execSync(`gh secret set ${key} ${repoFlag}`.trim(), {
      input: value,
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
    });
  } catch (error) {
    console.error(`Failed to set secret ${key}:`, error.message || error);
    process.exit(1);
  }
}

console.log("All secrets pushed successfully.");
