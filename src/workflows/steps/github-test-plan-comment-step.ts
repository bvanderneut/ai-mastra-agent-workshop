import { z } from "zod";
import { createStep } from "@mastra/core/workflows";
import { testPlanOutputSchema } from "./generate-test-plan-step";
import { parseGitHubUrl } from "../../mastra/helpers";
import { githubClient } from "../../mastra/github-client";
import { handleGitHubResponse } from "../../mastra/error-handler";

const formatTestCases = (
  testCases: Array<{ title: string; description: string }>
) => {
  return testCases
    .map((testCase) => `### ${testCase.title}\n${testCase.description}`)
    .join("\n\n");
};

export const githubTestPlanCommentStep = createStep({
  id: "github-test-plan-comment",
  inputSchema: testPlanOutputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    needsTesting: z.boolean(),
    testCases: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
  }),
  execute: async ({ inputData, getInitData, bail }) => {
    const { needsTesting, testCases } = inputData;
    const { pullRequestUrl } = getInitData();
    const token = process.env.GITHUB_TOKEN;

    // Parse PR URL
    const { apiBase, number } = parseGitHubUrl(pullRequestUrl);
    const apiUrl = `${apiBase}/issues/${number}/comments`;

    const commentBody = !needsTesting
      ? "## No testing needed"
      : `## Test Plan\n\n${formatTestCases(testCases)}`;

    // Post comment to GitHub
    const response = await githubClient.post(
      apiUrl,
      {
        body: commentBody,
      },
      token
    );

    handleGitHubResponse(response, "post comment");

    // If no testing is needed, exit early with bail()
    if (!needsTesting) {
      console.log(
        "No testing needed - stopping pipeline after test plan comment"
      );
      return bail({
        success: true,
        needsTesting: false,
        testCases: [],
      });
    }

    return { success: true, needsTesting, testCases };
  },
});
