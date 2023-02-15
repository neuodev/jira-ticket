export enum EnvVar {
  JiraApiToken = "JIRA_API_TOKEN",
  JiraUserEmail = "JIRA_USER_EMAIL",
  JiraBaseUrl = "JIRA_BASE_URL",
  GithubApiToken = "GITHUB_API_TOKEN",
  GitHubRepoOwner = "GITHUB_REPO_OWNER",
  GitHubRepoName = "GITHUB_REPO_NAME",
}

export function getEnvVarOrFail(envVar: EnvVar): string {
  const value = process.env[envVar];

  if (!value) throw new Error(`{${envVar}} environment variables is missing`);

  return value;
}
