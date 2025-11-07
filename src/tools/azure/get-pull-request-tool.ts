import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as azdev from "azure-devops-node-api";
import { parseAzureUrl } from "../../mastra/helpers";


export const getPullRequest = createTool({
  id: "get-pull-request",
  inputSchema: z.object({
    pullRequestUrl: z.string(),
  }),
  description: `Fetches a Azure pull request by URL. Use this to get PR details and state.`,
  execute: async ({ context: { pullRequestUrl } }) => {
    let orgUrl = process.env.AZURE_ORG_URL || "";
    let token: string = process.env.AZURE_PERSONAL_ACCESS_TOKEN || "";
    let authHandler = azdev.getPersonalAccessTokenHandler(token);
    let connection = new azdev.WebApi(orgUrl, authHandler);

    const { apiBase, number } = parseAzureUrl(pullRequestUrl);

    try {
      // Get the Git API client
      const gitApi = await connection.getGitApi();

      // Fetch the pullrequest data
      const workItem = await gitApi.getPullRequestById(number);

      console.log("Work Item:", workItem);

     

      return {
        number: number,
        title: workItem.title,
        body: workItem.description,
        state: workItem.status,
        merged: workItem.status === 3 ? true : false,
      };
    } catch (error) {
      console.error("Error fetching work item:", error);
      throw new Error(`Failed to fetch scrum issue 39206: ${error}`);
    }
  },
});
