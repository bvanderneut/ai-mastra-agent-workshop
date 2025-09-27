import { GitHubApiResponse } from "./types";

class GitHubApiClient {
  private baseHeaders: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Mastra-Agent-Workshop",
  };

  async get<T>(url: string, token?: string): Promise<GitHubApiResponse<T>> {
    const headers = { ...this.baseHeaders };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  }

  async post<T>(
    url: string,
    body: any,
    token?: string
  ): Promise<GitHubApiResponse<T>> {
    const headers: Record<string, string> = {
      ...this.baseHeaders,
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    return {
      data,
      status: response.status,
      ok: response.ok,
    };
  }
}

export const githubClient = new GitHubApiClient();
