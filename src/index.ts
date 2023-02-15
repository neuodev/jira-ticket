import { EnvVar, getEnvVarOrFail } from "./utils";
import dotenv from "dotenv";
import { GitHub } from "./github";

// Load environment variables from `.env`
dotenv.config({});

const github = new GitHub(
  getEnvVarOrFail(EnvVar.GitHubRepoOwner),
  getEnvVarOrFail(EnvVar.GitHubRepoName),
  getEnvVarOrFail(EnvVar.GithubApiToken)
);
