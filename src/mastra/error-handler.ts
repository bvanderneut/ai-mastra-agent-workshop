import { GitHubApiResponse } from "./types";

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: string
  ) {
    super(`${message} (${status}) on ${url}`);
    this.name = "GitHubApiError";
  }
}

export const handleGitHubResponse = <T>(
  response: GitHubApiResponse<T>,
  operation: string
): T => {
  if (!response.ok) {
    throw new GitHubApiError(
      `Failed to ${operation}`,
      response.status,
      "GitHub API"
    );
  }
  return response.data;
};
