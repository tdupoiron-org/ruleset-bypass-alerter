const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");

/**
 * GitHub Octokit client for interacting with the GitHub API.
 *
 * @type {Octokit}
 */
const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId: process.env.RULESET_BYPASS_ALERTER_APPID,
    privateKey: process.env.RULESET_BYPASS_ALERTER_PRIVATEKEY,
    installationId: process.env.RULESET_BYPASS_ALERTER_INSTALLATIONID,
  },
});

/**
 * Retrieves the organization name associated with the given installation ID.
 *
 * @param {number} installationId - The ID of the installation.
 * @returns {Promise<string>} - The organization name.
 */
async function getOrgNameFromInstallationId(installationId) {
  const { data } = await octokit.rest.apps.getInstallation({
    installation_id: installationId,
  });
  return data.account.login;
}

/**
 * Retrieves the rule suites for a given organization.
 *
 * @param {string} org - The name of the organization.
 * @returns {Promise<Array>} - A promise that resolves to an array of rule suites.
 */
async function getOrgRuleSuites(org) {
  const { data } = await octokit.rest.repos.getOrgRuleSuites({
    org,
    rule_suite_result: "bypass",
    time_period: "hour"
  });
  return data;
}

async function searchIssue(owner, repo, title) {
  const issues = await octokit.issues.listForRepo({
    owner,
    repo,
    state: "open",
  });

  return issues.data.find((issue) => issue.title === title);
}

/**
 * Creates an issue in a GitHub repository.
 *
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {string} title - The title of the issue.
 * @param {string} body - The body of the issue.
 * @returns {Promise<void>} - A promise that resolves when the issue is created.
 */
async function createIssue(owner, repo, title, body, actor) {
  const { data: issue } = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    assignees: [actor],
  });
  console.log(`Created issue: ${issue.html_url}`);
}

/**
 * The main function that retrieves organization rule suites and logs the data.
 */
async function main() {

    const installationId = process.env.RULESET_BYPASS_ALERTER_INSTALLATIONID;

    // 1. Get the organization name from the installation ID
    const orgName = await getOrgNameFromInstallationId(installationId);

    // 2. Get the rule suites for the organization
    const ruleSuites = await getOrgRuleSuites(orgName);
  
    console.log(`Organization: ${orgName}`);
    console.log(`Found ${ruleSuites.length} bypassed suites in the last day.`);

    // 3. Create an issue if there are any bypassed suites
    if (ruleSuites.length > 0) {

      // For each rule suite, create an issue
      for (const ruleSuite of ruleSuites) {

        console.log(JSON.stringify(ruleSuite, null, 2));

        const owner = orgName;
        const repo = ruleSuite.repository_name;
        const id = ruleSuite.id;
        const actor = ruleSuite.actor_name;
        const ref = ruleSuite.ref;
        const title = `🚨 Rule Suite Bypass Alert ${id} 🚨`;

        // Check if the actor is an app or a real user
        const isApp = actor.includes('[bot]') || actor.includes('[app]');

        if (!isApp) {
            const body = `
  # Rule Suite Bypass Alert

  Hello @${actor}!

  We noticed that you bypassed a ruleset on ref \`${ref}\`.

  We understand there may be valid reasons for this action. However, to ensure transparency and maintain good practices, we kindly request you to justify the bypass.

  Please add a comment to this issue explaining the reason for the bypass.

  Thank you for your cooperation!
          `;
          
          const existingIssue = await searchIssue(owner, repo, title);

          if (!existingIssue) {
            await createIssue(owner, repo, title, body, actor);
          }
          else {
            console.log(`Issue already exists: ${existingIssue.html_url}`);
          }

        }
        else {
          console.log(`Ignoring user ${actor}`);
        }
      }
    }

}

main();