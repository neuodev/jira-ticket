import axios from "axios";

export class JiraApi {
  token: string;
  email: string;
  baseUrl: string;

  constructor(token: string, email: string, baseUrl: string) {
    this.token = token;
    this.email = email;
    this.baseUrl = baseUrl;
  }

  getJiraAuthHeader() {
    const auth = Buffer.from([this.email, this.token].join(":")).toString(
      "base64"
    );
    return `Basic ${auth}`;
  }

  async getJiraIssueSummary(issueId: string): Promise<string> {
    const { data } = await axios.get(
      `${this.baseUrl}/rest/api/3/issue/${issueId}`,
      {
        headers: {
          Authorization: this.getJiraAuthHeader(),
        },
      }
    );

    return data.fields.summary;
  }
}
