import { z } from "zod";
import { createStep } from "@mastra/core/workflows";
import { testExecutionOutputSchema } from "./execute-tests-step";
import { parseAzureUrl } from "../../mastra/helpers";
import { githubClient } from "../../mastra/github-client";
import { handleGitHubResponse } from "../../mastra/error-handler";

const formatTestReport = (
  testCases: Array<{ title: string; status: "success" | "fail" }>
) => {
  return testCases
    .map((testCase) => {
      const emoji = testCase.status === "success" ? "✅" : "❌";
      return `${emoji} **${testCase.title}**`;
    })
    .join("\n");
};

export const githubTestReportStep = createStep({
  id: "github-test-report",
  inputSchema: testExecutionOutputSchema,
  outputSchema: z.object({ success: z.boolean() }),
  execute: async ({ inputData, getInitData }) => {
    const { needsTesting, testCases } = inputData;
    const { pullRequestUrl } = getInitData();
    const token = process.env.GITHUB_TOKEN;

    // Parse PR URL
    const { apiBase, number } = parseAzureUrl(pullRequestUrl);
    const apiUrl = `${apiBase}/issues/${number}/comments`;

    const commentBody = !needsTesting
      ? "## No testing needed"
      : `## Test Report\n\n${formatTestReport(testCases)}`;

    // Post comment to GitHub
    const response = await githubClient.post(
      apiUrl,
      {
        body: commentBody,
      },
      token
    );

    handleGitHubResponse(response, "post comment");
    return { success: true };
  },
});
