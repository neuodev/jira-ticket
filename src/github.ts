import axios from "axios";
import { EnvVar, getEnvVarOrFail } from "./utils";

const JIRA_COMMENT_FLAG = "__JIRA_COMMENT_FLAG";

type Comment = {
  id: number;
  body: string;
};
export class GitHub {
  owner: string;
  repo: string;
  token: string;
  constructor(owner: string, repo: string, token: string) {
    (this.owner = owner), (this.repo = repo), (this.token = token);
  }

  async getBranchName(pullId: number): Promise<string> {
    const { data } = await axios.get(
      `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${pullId}`,
      this.getDefaultConfig()
    );

    return data.head.ref;
  }

  async getPrevComment(pullId: number): Promise<Comment | null> {
    const { data } = await axios.get<Array<{ body: string; id: number }>>(
      `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${pullId}/comments`,
      this.getDefaultConfig()
    );
    const comment = data.find((c) => c.body.includes(JIRA_COMMENT_FLAG));
    if (!comment) return null;
    return comment;
  }

  async makeComment(pullId: number, body: string) {
    await axios.post(
      `https://api.github.com/repos/${this.owner}/${this.repo}/issues/${pullId}/comments`,
      {
        body,
      },
      this.getDefaultConfig()
    );
  }

  async updateComment(commentId: number, body: string) {
    await axios.post(
      `https://api.github.com/repos/${this.owner}/${this.repo}/issues/comments/${commentId}`,
      {
        body,
      },
      this.getDefaultConfig()
    );
  }

  getDefaultConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }

  makeInvalidBranchNameMsg(branchName: string): string {
    return this.withFlag(
      [
        `[autoscript] ⚠️ \`${branchName}\` doesn't full our branch naming convention.`,
        `Should follow \`<tag>/<jira-ticket-id>/<short-name>\``,
        `<details>`,
        `<summary>Details</summary>\n`,
        "- `<tag>`: `fix`, `feat`, `chore`, `refactor`, `test`, ...",
        "- `<jira-ticket-id>`: The issue ID of JIRA all capital letters",
        "- `<short-name>`: A short and descriptive name for the branch",
        `</details>`,
      ].join("\n")
    );
  }

  makeJiraCommentbody(
    jiraTicketId: string,
    jiraTicketSummary: string,
    jiraBaseUrl: string
  ) {
    return this.withFlag(
      `[autoscirpt] Jira Ticket: **[${jiraTicketSummary}](${jiraBaseUrl}/browse/${jiraTicketId})**`
    );
  }

  withFlag(body: string) {
    return `${body}\n\n[](${JIRA_COMMENT_FLAG})`;
  }
}

export function getJiraIdFromBranchName(branchName: string): string | null {
  const reBranchName = /(.*?)\/(.*?)\/(.*)/;
  let reMatch = branchName.match(reBranchName);
  if (!reMatch || !reMatch[2]) return null;
  return reMatch[2];
}
