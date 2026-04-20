// This script reads environment variables from a .env file and pushes them as GitHub repository secrets using the GitHub CLI.
// It ensures sensitive data like API keys are securely stored in GitHub for use in CI/CD pipelines or deployments.
// Usage: node scripts/push-secrets.js [optional-repo-name]
// If no repo is specified, it uses the current repository.

import fs from "fs";
import { execSync } from "child_process";
import path from "path";

// Resolve the path to the .env file in the repository root
const envPath = path.resolve(process.cwd(), ".env");

// Check if the .env file exists; exit if not found
if (!fs.existsSync(envPath)) {
  console.error("Error: .env file not found in the repository root.");
  process.exit(1);
}

// Read the contents of the .env file
const envContent = fs.readFileSync(envPath, "utf-8");

// Split the content into lines, handling both Unix and Windows line endings
const lines = envContent.split(/\r?\n/);

// Parse the lines to extract key-value pairs for environment variables
// Filter out empty lines, comments (starting with #), and lines without '='
const secrets = lines
  .map((line) => line.trim()) // Trim whitespace
  .filter((line) => line && !line.startsWith("#") && line.includes("=")) // Valid env lines
  .map((line) => {
    const [key, ...valueParts] = line.split("="); // Split on first '=', handle values with '='
    return { key: key.trim(), value: valueParts.join("=").trim() };
  })
  .filter((item) => item.key && item.value !== undefined); // Ensure key and value exist

// If no secrets were found, exit with an error
if (secrets.length === 0) {
  console.error("Error: No environment variables found in .env to push.");
  process.exit(1);
}

// Get the optional repository argument from command line (e.g., owner/repo)
const repoArg = process.argv[2];
const repoFlag = repoArg ? `--repo ${repoArg}` : ""; // Build the --repo flag if provided

// Inform the user about the process
console.log("Pushing secrets from .env to GitHub repository secrets...");
console.log("Make sure you have authenticated with 'gh auth login' and have repo write access.");

// Loop through each secret and set it using GitHub CLI
for (const { key, value } of secrets) {
  try {
    console.log(`> Setting secret ${key}`);
    // Execute the gh secret set command, passing the value via stdin for security
    execSync(`gh secret set ${key} ${repoFlag}`.trim(), {
      input: value, // Pass the secret value as input to avoid command line exposure
      stdio: ["pipe", "inherit", "inherit"], // Pipe input, inherit stdout/stderr
      shell: true, // Use shell to execute the command
    });
  } catch (error) {
    console.error(`Failed to set secret ${key}:`, error.message || error);
    process.exit(1); // Exit on failure
  }
}

// Confirm successful completion
console.log("All secrets pushed successfully.");

