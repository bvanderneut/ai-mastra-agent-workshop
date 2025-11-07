import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import * as azdev from "azure-devops-node-api";

export const getScrumIssue = createTool({
  id: "get-scrum-issue",
  inputSchema: z.object({
    issueId: z.string(),
  }),
  description: `Fetches a scrum issue by ID from the scrum board. Use this when an issue ID is mentioned in commit title or description of a pull request.`,
  execute: async ({ context: { issueId } }) => {
    let orgUrl = process.env.AZURE_ORG_URL || "";
    let token: string = process.env.AZURE_PERSONAL_ACCESS_TOKEN || "";
    let authHandler = azdev.getPersonalAccessTokenHandler(token);
    let connection = new azdev.WebApi(orgUrl, authHandler);

    try {
      // Get the Work Item Tracking API client
      const witApi = await connection.getWorkItemTrackingApi();

      // Fetch the work item using the Azure DevOps API
      const workItem = await witApi.getWorkItem(Number.parseInt(issueId));

      if (!workItem?.fields) {
        throw new Error(`Work item ${issueId} not found`);
      }

      return {
        id: workItem.id,
        title: workItem.fields["System.Title"],
        description:
          workItem.fields["System.WorkItemType"] === "Product Backlog Item"
            ? workItem.fields["System.Description"]
            : workItem.fields["Microsoft.VSTS.TCM.ReproSteps"],
        status: workItem.fields["System.State"],
        createdAt: workItem.fields["System.CreatedDate"],
        updatedAt: workItem.fields["System.ChangedDate"],
      };
    } catch (error) {
      throw new Error(`Failed to fetch scrum issue ${issueId}: ${error}`);
    }
  },
});
