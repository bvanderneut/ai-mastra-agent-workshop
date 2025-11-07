export const parseAzureUrl = (url: string) => {
  // Example URL: https://dev.azure.com/independernl/IndependerSite/_git/Independer/pullrequest/39206
  // Get the id out of the url
  // Get the baseUrl out of the url

  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  const apiBase = `${urlObj.protocol}//${urlObj.host}/${pathSegments[0]}/${pathSegments[1]}/_git/${pathSegments[3]}`;
  const type = pathSegments[4]; // e.g., "pullrequest"
  const number = pathSegments[5]; // e.g., "39206"

  return { apiBase, number: Number(number), type };
};
