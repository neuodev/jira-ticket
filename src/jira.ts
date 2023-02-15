import axios from "axios";
import { EnvVar, getEnvVarOrFail } from "./utils";

function getJiraAuthHeader() {
  const token = getEnvVarOrFail(EnvVar.JiraApiToken);
  const email = getEnvVarOrFail(EnvVar.JiraUserEmail);

  const auth = Buffer.from([email, token].join(":")).toString("base64");
  return `Basic ${auth}`;
}

export async function getJiraIssueSummary(issueId: string) {
  const baseUrl = getEnvVarOrFail(EnvVar.JiraBaseUrl);

  const { data } = await axios.get(`${baseUrl}/rest/api/3/issue/${issueId}`, {
    headers: {
      Authorization: getJiraAuthHeader(),
    },
  });

  return data.fields.summary;
}
