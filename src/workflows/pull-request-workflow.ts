import { createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { generateTestPlanStep } from "./steps/generate-test-plan-step";
import { githubTestPlanCommentStep } from "./steps/github-test-plan-comment-step";
import { waitForPreviewEnvironmentStep } from "./steps/wait-for-preview-environment-step";
import { executeTestsStep } from "./steps/execute-tests-step";
import { githubTestReportStep } from "./steps/github-test-report-step";

const genericOutputSchema = z.object({});

export const prWorkflow = createWorkflow({
  id: "pr-workflow",
  inputSchema: z.object({
    pullRequestUrl: z.string(),
  }),
  outputSchema: genericOutputSchema,
})
  .then(generateTestPlanStep)
  .then(githubTestPlanCommentStep)
  .map(async ({ inputData }) => {
    return { success: inputData.success };
  })
  .then(waitForPreviewEnvironmentStep)
  .then(executeTestsStep)
  .then(githubTestReportStep)
  .commit();
