import { EnvVar, getEnvVarOrFail } from "./utils";
import dotenv from "dotenv";
import { getJiraIdFromBranchName, GitHub } from "./github";
import { JiraApi } from "./jira";
import express, { Request, Response } from "express";
import "colors";
import axios from "axios";

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

      let commentBody: string | null;

      if (jiraTicketId === null) {
        commentBody = github.makeInvalidBranchNameMsg(branchName);
      } else {
        const summary = await jiraApi.getJiraIssueSummary(jiraTicketId);
        commentBody = github.makeJiraCommentbody(
          jiraTicketId,
          summary,
          jiraApi.baseUrl
        );
      }

      const prevComment = await github.getPrevComment(pullNum);

      if (prevComment === null) await github.makeComment(pullNum, commentBody);
      else await github.updateComment(prevComment.id, commentBody);

      res.status(200).end();
    } catch (error) {
      const err = axios.isAxiosError(error)
        ? error.response?.data
        : error instanceof Error
        ? error.message
        : error;

      res.status(404).json({ error: err });
    }
  }
);

const PORT = process.env["PORT"] || 8080;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`.bgCyan.bold)
);
