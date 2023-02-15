import axios from "axios";
import { EnvVar, getEnvVarOrFail } from "./utils";

class GitHub {
  owner: string;
  repo: string;
  token: string;
  constructor(owner: string, repo: string, token: string) {
    (this.owner = owner), (this.repo = repo), (this.token = token);
  }

  async getBranchName(id: number): Promise<string> {
    const { data } = await axios.get(
      `https://api.github.com/repos/${this.owner}/${this.repo}/pulls/${id}`,
      this.getDefaultConfig()
    );

    return data.head.ref;
  }

  async getPrevComment() {}

  getDefaultConfig() {
    return {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    };
  }
}

export function getJiraIdFromBranchName(branchName: string): string | null {
  const reBranchName = /(.*?)\/(.*?)\/(.*)/;
  let reMatch = branchName.match(reBranchName);
  if (!reMatch || !reMatch[2]) return null;
  return reMatch[2];
}
