import { EnvVar, getEnvVarOrFail } from "./utils";
import dotenv from "dotenv";
import { GitHub } from "./github";
import { JiraApi } from "./jira";

// Load environment variables from `.env`
dotenv.config({});

const github = new GitHub(
  getEnvVarOrFail(EnvVar.GitHubRepoOwner),
  getEnvVarOrFail(EnvVar.GitHubRepoName),
  getEnvVarOrFail(EnvVar.GithubApiToken)
);

const jiraApi = new JiraApi(
  getEnvVarOrFail(EnvVar.JiraApiToken),
  getEnvVarOrFail(EnvVar.JiraUserEmail),
  getEnvVarOrFail(EnvVar.JiraBaseUrl)
);
