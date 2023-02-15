import { EnvVar, getEnvVarOrFail } from "./utils";
import dotenv from "dotenv";
import { getJiraIdFromBranchName, GitHub } from "./github";
import { JiraApi } from "./jira";
import express, { Request, Response } from "express";
import "colors";

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

const app = express();

app.get(
  "/api/v1/pull/:pullId",
  async (req: Request<{ pullId: string }>, res: Response) => {
    const { pullId } = req.params;

    try {
      const pullNum = Number(pullId);
      if (Number.isNaN(pullNum))
        throw new Error(
          `{${pullId}} is not a valid pull request id. Must be a number`
        );
      const branchName = await github.getBranchName(pullNum);
      const jiraTicketId = getJiraIdFromBranchName(branchName);

      if (jiraTicketId === null) {
        await github.makeComment(
          pullNum,
          github.makeInvalidBranchNameMsg(branchName)
        );
      }

      res.status(200).end();
    } catch (error) {}
  }
);

const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.bgCyan.bold)
);
