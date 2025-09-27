export const parseGitHubUrl = (url: string) => {
  const match = url.match(/github.com\/(.+?)\/(.+?)\/(pull|issues)\/(\d+)/);
  if (!match) throw new Error("Invalid GitHub URL");
  const [_, owner, repo, type, number] = match;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;
  return { apiBase, number: Number(number), type };
};
